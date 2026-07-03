import pool from '../db/database.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    // 1. KPI: Total Market Udhaar (Accounts Receivable)
    const receivablesRes = await pool.query(`SELECT COALESCE(SUM(outstanding_balance), 0) AS total FROM customers`);
    const totalReceivables = parseFloat(receivablesRes.rows[0].total);

    // 2. KPI: Total Supplier Debt (Accounts Payable)
    const payablesRes = await pool.query(`SELECT COALESCE(SUM(payable_balance), 0) AS total FROM suppliers`);
    const totalPayables = parseFloat(payablesRes.rows[0].total);

    // 3. KPI: Inventory Valuation (What is your current stock worth?)
    const inventoryRes = await pool.query(`
      SELECT 
        COALESCE(SUM(quantity * cost_price), 0) AS total_investment,
        COALESCE(SUM(quantity * sale_price), 0) AS potential_revenue
      FROM plants WHERE health_status != 'Dead'
    `);
    const inventoryValue = parseFloat(inventoryRes.rows[0].total_investment);
    const potentialRevenue = parseFloat(inventoryRes.rows[0].potential_revenue);

    // 4. CASH FLOW (Cash In vs Cash Out)
    const cashInRes = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(amount_paid), 0) FROM invoices) +
        (SELECT COALESCE(SUM(amount_paid), 0) FROM customer_payments) AS total_in
    `);
    const totalCashIn = parseFloat(cashInRes.rows[0].total_in);

    const cashOutRes = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(amount_paid), 0) FROM supplier_payments) +
        (SELECT COALESCE(SUM(amount), 0) FROM expenses) AS total_out
    `);
    const totalCashOut = parseFloat(cashOutRes.rows[0].total_out);
    const cashInHand = totalCashIn - totalCashOut;

    // 5. SALES TREND (Last 30 Days for Line Chart)
    const salesTrendRes = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(total_amount) as daily_revenue
      FROM invoices
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    // 6. TOP SELLING PLANTS (Fixed: Joined with the plants table to get the name)
    const topPlantsRes = await pool.query(`
      SELECT 
        p.name, 
        SUM(ii.quantity) as total_sold
      FROM invoice_items ii
      JOIN plants p ON ii.plant_id = p.id
      GROUP BY p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // 7. PROFIT & LOSS (P&L) SUMMARY
    const revenueRes = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS total FROM invoices`);
    const totalRevenue = parseFloat(revenueRes.rows[0].total);
    
    const expenseRes = await pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM expenses`);
    const totalExpenses = parseFloat(expenseRes.rows[0].total);

    res.json({
      success: true,
      kpis: {
        totalReceivables,
        totalPayables,
        inventoryValue,
        potentialRevenue,
        totalCashIn,
        totalCashOut,
        cashInHand,
        totalRevenue,
        totalExpenses,
        netCashFlow: totalCashIn - totalCashOut
      },
      charts: {
        salesTrend: salesTrendRes.rows,
        topPlants: topPlantsRes.rows
      }
    });

  } catch (err) {
    console.error('Error generating report metrics:', err);
    res.status(500).json({ error: 'Failed to generate dashboard reports.' });
  }
};

// 🧾 GET FULL INVOICE HISTORY (For the Ledger / Search)
export const getInvoiceHistory = async (req, res) => {
  try {
    const query = `
      SELECT 
        i.id, 
        i.total_amount, 
        i.amount_paid, 
        i.discount,
        i.extra_charges,
        i.created_at,
        c.name as customer_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json({ success: true, history: result.rows });
  } catch (err) {
    console.error('Error fetching invoice history:', err);
    res.status(500).json({ error: 'Failed to fetch invoice history.' });
  }
};