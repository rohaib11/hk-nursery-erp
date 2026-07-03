import pool from '../db/database.js';

// 🧾 GET ALL INVOICES
export const getAllInvoices = async (req, res) => {
  try {
    const query = `
      SELECT i.*, c.name as customer_name 
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Failed to fetch invoices.' });
  }
};

// 🛒 PROCESS CHECKOUT (Create Invoice & Deduct Stock)
export const createInvoice = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { 
      customer_id, items, discount, extra_charges, amount_paid, notes 
    } = req.body;

    if (!items || items.length === 0) {
      throw new Error('Cart cannot be empty.');
    }

    let subtotal = 0;
    let totalProfit = 0;
    const parsedDiscount = parseFloat(discount) || 0;
    const parsedExtra = parseFloat(extra_charges) || 0;
    const parsedPaid = parseFloat(amount_paid) || 0;

    // 1. Generate unique invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    // 2. Pre-flight Check: Verify stock & calculate totals
    const processedItems = [];
    
    for (const item of items) {
      const plantRes = await client.query('SELECT name, quantity, cost_price FROM plants WHERE id = $1', [item.plant_id]);
      if (plantRes.rows.length === 0) throw new Error(`Plant ID ${item.plant_id} not found.`);
      
      const plant = plantRes.rows[0];
      const saleQty = parseInt(item.quantity);
      
      if (plant.quantity < saleQty) {
        throw new Error(`Not enough stock for ${plant.name}. Available: ${plant.quantity}`);
      }

      const unitPrice = parseFloat(item.unit_price);
      const unitCost = parseFloat(plant.cost_price) || 0;
      const totalPrice = unitPrice * saleQty;
      const itemProfit = (unitPrice - unitCost) * saleQty;

      subtotal += totalPrice;
      totalProfit += itemProfit;

      processedItems.push({
        plant_id: item.plant_id,
        plant_name: plant.name,
        quantity: saleQty,
        unit_price: unitPrice,
        unit_cost: unitCost,
        total_price: totalPrice,
        item_profit: itemProfit
      });
    }

    // Adjust total profit if a global discount is given
    totalProfit -= parsedDiscount; 
    
    const totalAmount = (subtotal + parsedExtra) - parsedDiscount;
    const udhaarAmount = Math.max(totalAmount - parsedPaid, 0);

    // 3. Create the Invoice
    const invQuery = `
      INSERT INTO invoices (
        invoice_number, customer_id, subtotal, discount, extra_charges, 
        total_amount, amount_paid, udhaar_amount, total_profit, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
    `;
    const invValues = [
      invoiceNumber, customer_id || null, subtotal, parsedDiscount, parsedExtra,
      totalAmount, parsedPaid, udhaarAmount, totalProfit, notes
    ];
    
    const invResult = await client.query(invQuery, invValues);
    const invoiceId = invResult.rows[0].id;

    // 4. Insert Invoice Items & Deduct Stock
    for (const item of processedItems) {
      // Insert item
      await client.query(`
        INSERT INTO invoice_items (
          invoice_id, plant_id, plant_name, quantity, unit_price, unit_cost, total_price, item_profit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [invoiceId, item.plant_id, item.plant_name, item.quantity, item.unit_price, item.unit_cost, item.total_price, item.item_profit]);

      // Deduct stock
      await client.query(`
        UPDATE plants SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
      `, [item.quantity, item.plant_id]);
    }

    // 5. Update Customer Khata (If Udhaar exists and customer is selected)
    if (udhaarAmount > 0 && customer_id) {
      await client.query(`
        UPDATE customers SET outstanding_balance = outstanding_balance + $1 WHERE id = $2
      `, [udhaarAmount, customer_id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Checkout complete.', invoice_id: invoiceId });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', err);
    res.status(400).json({ error: err.message || 'Failed to process checkout.' });
  } finally {
    client.release();
  }
};