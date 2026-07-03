import pool from '../db/database.js';

// 👥 GET ALL CUSTOMERS
export const getAllCustomers = async (req, res) => {
  try {
    const query = `SELECT * FROM customers ORDER BY name ASC`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers.' });
  }
};

// 👥 CREATE NEW CUSTOMER (Failsafe Formats)
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, address, starting_balance } = req.body;
    
    // 1. Validation Check
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Customer name is required.' });
    }

    // 2. Failsafe Type Casting (Ensures an empty input doesn't pass an empty string to DECIMAL)
    const initialBalance = starting_balance && !isNaN(parseFloat(starting_balance)) 
      ? parseFloat(starting_balance) 
      : 0.00;

    // 3. Match Database Column Nomenclature Exactly
    const query = `
      INSERT INTO customers (name, phone, address, outstanding_balance) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const values = [
      name.trim(), 
      phone || null, 
      address || null, 
      initialBalance
    ];
    
    const result = await pool.query(query, values);
    res.status(201).json({ success: true, customer: result.rows[0] });
  } catch (err) {
    // This logs the exact system database error string to your node console window
    console.error('💥 Error in createCustomer backend logic:', err.message || err);
    res.status(500).json({ error: 'Database transaction failed. Check your terminal logs.' });
  }
};

// 💸 PROCESS UDHAAR PAYMENT
export const addCustomerPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { customer_id } = req.params;
    const { amount_paid, payment_method, notes } = req.body;
    const amount = parseFloat(amount_paid);

    if (!amount || amount <= 0) throw new Error('Valid payment amount required.');

    const paymentQuery = `
      INSERT INTO customer_payments (customer_id, amount_paid, payment_method, notes)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    await client.query(paymentQuery, [customer_id, amount, payment_method || 'Cash', notes]);

    const updateQuery = `
      UPDATE customers 
      SET outstanding_balance = outstanding_balance - $1 
      WHERE id = $2 RETURNING *
    `;
    const result = await client.query(updateQuery, [amount, customer_id]);

    await client.query('COMMIT');
    res.json({ success: true, customer: result.rows[0], message: 'Payment recorded successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing payment:', err);
    res.status(400).json({ error: err.message || 'Failed to process payment.' });
  } finally {
    client.release();
  }
};