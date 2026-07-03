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
      if (err) console.error('Failed to delete old image:', err);
    });
  }
};

// GET ALL PLANTS (with category info)
export const getAllPlants = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        pc.name AS category_name,
        pc.icon AS category_icon
      FROM plants p
      LEFT JOIN plant_categories pc ON p.category_id = pc.id
      ORDER BY p.updated_at DESC, p.name ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching plants:', err);
    res.status(500).json({ error: 'Failed to fetch plants.' });
  }
};

// GET SINGLE PLANT
export const getPlantById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        p.*,
        pc.name AS category_name,
        pc.icon AS category_icon
      FROM plants p
      LEFT JOIN plant_categories pc ON p.category_id = pc.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching plant:', err);
    res.status(500).json({ error: 'Failed to fetch plant.' });
  }
};

// CREATE PLANT
export const createPlant = async (req, res) => {
  try {
    const {
      name, local_name, category_id, quantity,
      cost_price, sale_price, wholesale_price, pot_size, pot_cost,
      health_status, growth_status, location_id,
      supplier_id, batch_code, sowing_date, notes
    } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ error: 'Name and category are required.' });
    }

    // If marked dead on creation, force 0 stock. Otherwise parse quantity.
    const finalQuantity = health_status === 'Dead' ? 0 : parseInt(quantity) || 0;

    let imagePath = null;
    if (req.file) {
      imagePath = path.join('uploads', 'plants', req.file.filename).replace(/\\/g, '/');
    }

    const query = `
      INSERT INTO plants (
        name, local_name, category_id, quantity,
        cost_price, sale_price, wholesale_price, pot_size, pot_cost,
        health_status, growth_status, location_id,
        supplier_id, batch_code, sowing_date,
        notes, primary_image
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *
    `;
    const values = [
      name,
      local_name || null,
      parseInt(category_id),
      finalQuantity,
      parseFloat(cost_price) || 0,
      parseFloat(sale_price) || 0,
      parseFloat(wholesale_price) || 0,
      pot_size || null,
      parseFloat(pot_cost) || 0,
      health_status || 'Healthy',
      growth_status || 'Growing',
      location_id || null,
      supplier_id || null,
      batch_code || null,
      sowing_date || null,
      notes || null,
      imagePath
    ];

    const result = await pool.query(query, values);
    const newPlant = result.rows[0];
    const catResult = await pool.query('SELECT name, icon FROM plant_categories WHERE id = $1', [newPlant.category_id]);
    if (catResult.rows.length > 0) {
      newPlant.category_name = catResult.rows[0].name;
      newPlant.category_icon = catResult.rows[0].icon;
    }

    res.status(201).json(newPlant);
  } catch (err) {
    console.error('Error creating plant:', err);
    res.status(500).json({ error: 'Failed to create plant.' });
  }
};

// UPDATE PLANT
export const updatePlant = async (req, res) => {
  const { id } = req.params;
  try {
    const existingPlant = await pool.query('SELECT * FROM plants WHERE id = $1', [id]);
    if (existingPlant.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found.' });
    }

    const oldData = existingPlant.rows[0];
    const {
      name, local_name, category_id, quantity,
      cost_price, sale_price, wholesale_price, pot_size, pot_cost,
      health_status, growth_status, location_id,
      supplier_id, batch_code, sowing_date, notes
    } = req.body;

    // Full Batch Override: If status changed to Dead in edit modal, wipe stock.
    const finalQuantity = health_status === 'Dead' ? 0 : parseInt(quantity) || oldData.quantity;

    let imagePath = oldData.primary_image;
    if (req.file) {
      deleteOldImage(oldData.primary_image);
      imagePath = path.join('uploads', 'plants', req.file.filename).replace(/\\/g, '/');
    }

    const query = `
      UPDATE plants SET
        name = COALESCE($1, name),
        local_name = COALESCE($2, local_name),
        category_id = COALESCE($3, category_id),
        quantity = $4,
        cost_price = COALESCE($5, cost_price),
        sale_price = COALESCE($6, sale_price),
        wholesale_price = COALESCE($7, wholesale_price),
        pot_size = COALESCE($8, pot_size),
        pot_cost = COALESCE($9, pot_cost),
        health_status = COALESCE($10, health_status),
        growth_status = COALESCE($11, growth_status),
        location_id = COALESCE($12, location_id),
        supplier_id = COALESCE($13, supplier_id),
        batch_code = COALESCE($14, batch_code),
        sowing_date = COALESCE($15, sowing_date),
        notes = COALESCE($16, notes),
        primary_image = $17,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $18
      RETURNING *
    `;
    const values = [
      name || null,
      local_name || null,
      category_id ? parseInt(category_id) : null,
      finalQuantity,
      cost_price !== undefined ? parseFloat(cost_price) : null,
      sale_price !== undefined ? parseFloat(sale_price) : null,
      wholesale_price !== undefined ? parseFloat(wholesale_price) : null,
      pot_size !== undefined ? pot_size : null,
      pot_cost !== undefined ? parseFloat(pot_cost) : null,
      health_status || null,
      growth_status || null,
      location_id || null,
      supplier_id || null,
      batch_code || null,
      sowing_date || null,
      notes || null,
      imagePath,
      id
    ];

    const result = await pool.query(query, values);
    const updatedPlant = result.rows[0];

    const catResult = await pool.query('SELECT name, icon FROM plant_categories WHERE id = $1', [updatedPlant.category_id]);
    if (catResult.rows.length > 0) {
      updatedPlant.category_name = catResult.rows[0].name;
      updatedPlant.category_icon = catResult.rows[0].icon;
    }

    res.json(updatedPlant);
  } catch (err) {
    console.error('Error updating plant:', err);
    res.status(500).json({ error: 'Failed to update plant.' });
  }
};

// DELETE PLANT
export const deletePlant = async (req, res) => {
  const { id } = req.params;
  try {
    const plantResult = await pool.query('SELECT * FROM plants WHERE id = $1', [id]);
    if (plantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found.' });
    }

    const plant = plantResult.rows[0];
    deleteOldImage(plant.primary_image);

    await pool.query('DELETE FROM plants WHERE id = $1', [id]);
    res.json({ success: true, message: 'Plant deleted successfully.' });
  } catch (err) {
    console.error('Error deleting plant:', err);
    res.status(500).json({ error: 'Failed to delete plant.' });
  }
};

// 🆕 LOG PARTIAL MORTALITY (Deduct specific number of dead plants)
export const logPlantMortality = async (req, res) => {
  const { id } = req.params;
  const { dead_count, reason } = req.body;

  try {
    // 1. Fetch current plant to verify stock
    const plantResult = await pool.query('SELECT * FROM plants WHERE id = $1', [id]);
    if (plantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plant not found.' });
    }

    const plant = plantResult.rows[0];
    const countToRemove = parseInt(dead_count, 10);

    if (isNaN(countToRemove) || countToRemove <= 0) {
      return res.status(400).json({ error: 'Invalid mortality count.' });
    }
    if (countToRemove > plant.quantity) {
      return res.status(400).json({ error: 'Cannot mark more plants dead than currently in stock.' });
    }

    // 2. Calculate new quantity
    const newQuantity = plant.quantity - countToRemove;

    // 3. Auto-generate a note for the history log
    const dateStr = new Date().toISOString().split('T')[0];
    const mortalityNote = `\n[${dateStr}] ⚠️ ${countToRemove} plants marked dead. Reason: ${reason || 'Not specified'}`;
    const updatedNotes = (plant.notes ? plant.notes : '') + mortalityNote;

    // 4. Update the database
    const updateQuery = `
      UPDATE plants 
      SET quantity = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(updateQuery, [newQuantity, updatedNotes, id]);
    const updatedPlant = result.rows[0];

    // 5. Append category info for the frontend UI return
    const catResult = await pool.query('SELECT name, icon FROM plant_categories WHERE id = $1', [updatedPlant.category_id]);
    if (catResult.rows.length > 0) {
      updatedPlant.category_name = catResult.rows[0].name;
      updatedPlant.category_icon = catResult.rows[0].icon;
    }

    res.json({ success: true, plant: updatedPlant, message: `Successfully logged ${countToRemove} dead plants.` });
  } catch (err) {
    console.error('Error logging plant mortality:', err);
    res.status(500).json({ error: 'Failed to log plant mortality.' });
  }
};