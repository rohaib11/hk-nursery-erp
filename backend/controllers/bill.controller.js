import db from '../db/database.js';

export const createBill = (req, res) => {
    const { customer_name, phone, items, discount = 0, payment_method, payment_status, amount_paid } = req.body;

    // SQLite Transaction ensures all parts of the invoice process perfectly or fail together safely
    const generateInvoiceTransaction = db.transaction(() => {
        
        // --- 1. Handle Customer (Find existing by phone, or Create new) ---
        let customerId = null;
        if (customer_name) {
            const existingCust = db.prepare(`SELECT id FROM customers WHERE phone = ?`).get(phone);
            if (existingCust) {
                customerId = existingCust.id;
            } else {
                const custResult = db.prepare(`INSERT INTO customers (name, phone) VALUES (?, ?)`).run(customer_name, phone);
                customerId = custResult.lastInsertRowid;
            }
        }

        // --- 2. Calculate Totals ---
        let subtotal = 0;
        items.forEach(item => subtotal += (item.quantity * item.sale_price));
        const total_amount = subtotal - discount;

        // --- 3. Create the Main Bill Record ---
        const invoice_number = `INV-${Date.now()}`;
        const billResult = db.prepare(`
            INSERT INTO bills (invoice_number, customer_id, subtotal, discount, total_amount, payment_method, payment_status, amount_paid)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(invoice_number, customerId, subtotal, discount, total_amount, payment_method, payment_status, amount_paid);
        
        const billId = billResult.lastInsertRowid;

        // --- 4. Process Items, Deduct Stock, and Log Movements ---
        const insertItem = db.prepare(`INSERT INTO bill_items (bill_id, plant_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)`);
        const updateStock = db.prepare(`UPDATE plants SET quantity = quantity - ? WHERE id = ?`);
        const logStock = db.prepare(`INSERT INTO stock_movements (plant_id, type, quantity, ref_id, ref_type, note) VALUES (?, 'sale', ?, ?, 'bill', 'Sold via invoice')`);

        items.forEach(item => {
            const itemTotal = item.quantity * item.sale_price;
            insertItem.run(billId, item.plant_id, item.quantity, item.sale_price, itemTotal);
            
            // Deduct stock and log it
            updateStock.run(item.quantity, item.plant_id);
            logStock.run(item.plant_id, item.quantity, billId);
        });

        // --- 5. Accounting: Customer Ledger & Payments ---
        if (customerId) {
            // Debit: Add the total bill amount to their Udhaar ledger
            db.prepare(`INSERT INTO customer_ledger (customer_id, debit, credit, reference_type, reference_id, description) VALUES (?, ?, 0, 'bill', ?, 'Invoice Billed')`)
              .run(customerId, total_amount, billId);

            // Credit: Subtract whatever they paid right now from their Udhaar ledger
            if (amount_paid > 0) {
                db.prepare(`INSERT INTO customer_ledger (customer_id, debit, credit, reference_type, reference_id, description) VALUES (?, 0, ?, 'payment', ?, 'Payment Received on Bill')`)
                  .run(customerId, amount_paid, billId);
            }
        }

        // Log the actual payment received to the cash drawer
        if (amount_paid > 0) {
            db.prepare(`INSERT INTO payments (bill_id, amount, method, note) VALUES (?, ?, ?, 'Initial invoice payment')`)
              .run(billId, amount_paid, payment_method);
        }

        return billId;
    });

    try {
        const newBillId = generateInvoiceTransaction();
        res.status(201).json({ success: true, message: "Invoice generated successfully", billId: newBillId });
    } catch (err) {
        console.error("Billing Error:", err.message);
        res.status(500).json({ error: "Failed to process billing transaction due to a database conflict." });
    }
};

// Simple fetch to get all bills for the table view
export const getBills = (req, res) => {
    try {
        const bills = db.prepare(`
            SELECT b.*, c.name as customer_name, c.phone 
            FROM bills b 
            LEFT JOIN customers c ON b.customer_id = c.id 
            ORDER BY b.bill_date DESC LIMIT 100
        `).all();
        res.json(bills);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch invoices." });
    }
};