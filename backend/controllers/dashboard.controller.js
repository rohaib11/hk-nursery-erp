import pool from '../db/database.js';

export const getHomeSummary = async (req, res) => {
  try {
    // 1. Today's Sales (Revenue & Count)
    const todaySalesRes = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue, 
        COUNT(*) as total_invoices 
      FROM invoices 
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // 2. Low Stock Alerts (Plants with fewer than 50 items)
    const lowStockRes = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        p.local_name, 
        p.quantity, 
        COALESCE(pc.name, 'Uncategorized') AS category
      FROM plants p
      LEFT JOIN plant_categories pc ON p.category_id = pc.id
      WHERE p.quantity < 50 AND p.health_status != 'Dead'
      ORDER BY p.quantity ASC 
      LIMIT 6
    `);

    // 3. Top Debtors (Customers owing the most Udhaar)
    const topDebtorsRes = await pool.query(`
      SELECT id, name, phone, outstanding_balance 
      FROM customers 
      WHERE outstanding_balance > 0 
      ORDER BY outstanding_balance DESC 
      LIMIT 6
    `);

    res.json({
      success: true,
      today: {
        revenue: parseFloat(todaySalesRes.rows[0].total_revenue),
        invoiceCount: parseInt(todaySalesRes.rows[0].total_invoices)
      },
      lowStock: lowStockRes.rows,
      topDebtors: topDebtorsRes.rows
    });

  } catch (err) {
    console.error('Error fetching home dashboard summary:', err);
    res.status(500).json({ error: 'Failed to load dashboard summary.' });
  }
};