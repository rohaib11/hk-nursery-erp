import pool from '../db/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteOldImage = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(__dirname, '..', relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error('Failed to delete old receipt:', err);
    });
  }
};

// 💰 GET ALL EXPENSES
export const getAllExpenses = async (req, res) => {
  try {
    const query = `
      SELECT e.*, p.name as plant_name, p.local_name, p.batch_code
      FROM expenses e
      LEFT JOIN plants p ON e.plant_id = p.id
      ORDER BY e.expense_date DESC, e.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
};

// 💰 CREATE EXPENSE (Multi-Batch Support)
export const createExpense = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      title, category, amount, expense_date,
      plant_ids, is_batch_expense,
      split_method, notes
    } = req.body;

    if (!title || !category || !amount) {
      throw new Error('Title, category, and amount are required.');
    }

    const parsedAmount = parseFloat(amount);
    const isBatch = is_batch_expense === 'true' || is_batch_expense === true;
    let targetPlantIds = [];

    if (isBatch) {
      if (!plant_ids) throw new Error('Please select at least one plant batch.');
      if (typeof plant_ids === 'string') {
        targetPlantIds = plant_ids.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      } else if (Array.isArray(plant_ids)) {
        targetPlantIds = plant_ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      }
      if (targetPlantIds.length === 0) throw new Error('No valid plant IDs provided.');
    }

    let results = [];

    if (isBatch) {
      const plantRes = await client.query(
        'SELECT id, name, quantity, cost_price FROM plants WHERE id = ANY($1)',
        [targetPlantIds]
      );
      if (plantRes.rows.length === 0) throw new Error('No selected plants found.');

      const plants = plantRes.rows;
      const totalStock = plants.reduce((sum, p) => sum + p.quantity, 0);
      if (totalStock <= 0) throw new Error('All selected plants have zero stock.');

      const splitMethod = split_method || 'proportional';

      for (const plant of plants) {
        let plantShare = 0;
        if (splitMethod === 'equal') {
          plantShare = parsedAmount / plants.length;
        } else {
          plantShare = (plant.quantity / totalStock) * parsedAmount;
        }

        const unitCostAdded = plant.quantity > 0 ? plantShare / plant.quantity : 0;
        const newCostPrice = parseFloat(plant.cost_price) + unitCostAdded;

        await client.query(
          'UPDATE plants SET cost_price = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newCostPrice, plant.id]
        );

        const receiptPath = req.file
          ? path.join('uploads', 'receipts', req.file.filename).replace(/\\/g, '/')
          : null;

        const insertQuery = `
          INSERT INTO expenses (
            title, category, amount, expense_date,
            plant_id, is_batch_expense, unit_cost_added,
            notes, receipt_image
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `;
        const expenseValues = [
          title,
          category,
          plantShare.toFixed(2),
          expense_date || new Date().toISOString().split('T')[0],
          plant.id,
          true,
          unitCostAdded.toFixed(2),
          notes || null,
          receiptPath
        ];

        const { rows } = await client.query(insertQuery, expenseValues);
        results.push(rows[0]);
      }
    } else {
      const receiptPath = req.file
        ? path.join('uploads', 'receipts', req.file.filename).replace(/\\/g, '/')
        : null;

      const insertQuery = `
        INSERT INTO expenses (
          title, category, amount, expense_date,
          plant_id, is_batch_expense, unit_cost_added,
          notes, receipt_image
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        title, category, parsedAmount, expense_date || new Date().toISOString().split('T')[0],
        null, false, 0, notes || null, receiptPath
      ];

      const { rows } = await client.query(insertQuery, values);
      results.push(rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      expenses: results,
      message: isBatch
        ? `Expense split among ${results.length} batch(es).`
        : 'Expense logged successfully.'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating expense:', err);
    res.status(400).json({ error: err.message || 'Failed to create expense.' });
  } finally {
    client.release();
  }
};

// 💰 UPDATE EXPENSE (Smart Math Reversals)
export const updateExpense = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { title, category, amount, expense_date, notes } = req.body;

    const expRes = await client.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (expRes.rows.length === 0) throw new Error('Expense not found');
    const oldExp = expRes.rows[0];

    const newAmount = parseFloat(amount);

    let receiptPath = oldExp.receipt_image;
    if (req.file) {
      deleteOldImage(oldExp.receipt_image);
      receiptPath = path.join('uploads', 'receipts', req.file.filename).replace(/\\/g, '/');
    }

    let newUnitCostAdded = oldExp.unit_cost_added;

    // 🌿 If this was a batch expense, do the accounting reversal logic
    if (oldExp.is_batch_expense && oldExp.plant_id) {
      const plantRes = await client.query('SELECT id, quantity, cost_price FROM plants WHERE id = $1', [oldExp.plant_id]);
      
      if (plantRes.rows.length > 0) {
        const plant = plantRes.rows[0];

        // Step 1: Remove the old unit cost from the plant
        let currentCost = parseFloat(plant.cost_price);
        currentCost -= parseFloat(oldExp.unit_cost_added);

        // Step 2: Calculate the new unit cost based on the updated amount
        newUnitCostAdded = plant.quantity > 0 ? (newAmount / plant.quantity) : 0;

        // Step 3: Add the new unit cost
        currentCost += newUnitCostAdded;

        // Failsafe: Never let a plant's cost drop below zero
        currentCost = Math.max(currentCost, 0);

        // Save new cost to the plant
        await client.query('UPDATE plants SET cost_price = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [currentCost, plant.id]);
      }
    }

    // Update the expense record
    const updateQuery = `
      UPDATE expenses SET
        title = $1, category = $2, amount = $3, expense_date = $4,
        unit_cost_added = $5, notes = $6, receipt_image = $7
      WHERE id = $8 RETURNING *
    `;
    const values = [
      title || oldExp.title,
      category || oldExp.category,
      newAmount,
      expense_date || oldExp.expense_date,
      newUnitCostAdded,
      notes || oldExp.notes,
      receiptPath,
      id
    ];

    const result = await client.query(updateQuery, values);
    
    await client.query('COMMIT');
    res.json({ success: true, expense: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating expense:', err);
    res.status(400).json({ error: err.message || 'Failed to update expense.' });
  } finally {
    client.release();
  }
};

// 💰 DELETE EXPENSE (Smart Math Reversals)
export const deleteExpense = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const expResult = await client.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (expResult.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found.' });
    }
    const expense = expResult.rows[0];

    // 🌿 SMART REVERSAL: If it was a batch expense, deduct the cost back out of the plant
    if (expense.is_batch_expense && expense.plant_id && expense.unit_cost_added > 0) {
      await client.query(
        'UPDATE plants SET cost_price = GREATEST(cost_price - $1, 0), updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [expense.unit_cost_added, expense.plant_id]
      );
    }

    deleteOldImage(expense.receipt_image);
    await client.query('DELETE FROM expenses WHERE id = $1', [id]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Expense deleted and accounting reversed successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Failed to delete expense.' });
  } finally {
    client.release();
  }
};