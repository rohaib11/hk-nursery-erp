import pool from '../db/database.js';

// 🚚 GET ALL SUPPLIERS
export const getAllSuppliers = async (req, res) => {
  try {
    const query = `SELECT * FROM suppliers ORDER BY name ASC`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ error: 'Failed to fetch suppliers.' });
  }
};

// 🚚 CREATE NEW SUPPLIER (Vendor)
export const createSupplier = async (req, res) => {
  try {
    const { name, company_name, phone, address, starting_balance } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Supplier name is required.' });
    }

    const initialBalance = starting_balance && !isNaN(parseFloat(starting_balance)) 
      ? parseFloat(starting_balance) 
      : 0.00;

    const query = `
      INSERT INTO suppliers (name, company_name, phone, address, payable_balance) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const values = [
      name.trim(), 
      company_name || null,
      phone || null, 
      address || null, 
      initialBalance
    ];
    
    const result = await pool.query(query, values);
    res.status(201).json({ success: true, supplier: result.rows[0] });
  } catch (err) {
    console.error('Error creating supplier:', err.message || err);
    res.status(500).json({ error: 'Failed to create supplier.' });
  }
};

// 💸 PROCESS OUTGOING PAYMENT (You paying the vendor)
export const addSupplierPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { supplier_id } = req.params;
    const { amount_paid, payment_method, notes } = req.body;
    const amount = parseFloat(amount_paid);

    if (!amount || amount <= 0) throw new Error('Valid payment amount required.');

    // 1. Log the payment going out
    const paymentQuery = `
      INSERT INTO supplier_payments (supplier_id, amount_paid, payment_method, notes)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    await client.query(paymentQuery, [supplier_id, amount, payment_method || 'Cash', notes]);

    // 2. Reduce the amount you owe them (Payable Balance)
    const updateQuery = `
      UPDATE suppliers 
      SET payable_balance = payable_balance - $1 
      WHERE id = $2 RETURNING *
    `;
    const result = await client.query(updateQuery, [amount, supplier_id]);

    await client.query('COMMIT');
    res.json({ success: true, supplier: result.rows[0], message: 'Payment to supplier recorded successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing supplier payment:', err);
    res.status(400).json({ error: err.message || 'Failed to process payment.' });
  } finally {
    client.release();
  }
};