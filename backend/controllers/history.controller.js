import pool from '../db/database.js';

export const getPlantHistory = async (req, res) => {
  const { plantId } = req.params;
  try {
    const query = `
      SELECT 
        ph.id,
        ph.action,
        ph.changed_fields,
        ph.old_values,
        ph.new_values,
        ph.performed_by,
        ph.performed_at,
        u.username as performed_by_username
      FROM plant_history ph
      LEFT JOIN users u ON ph.performed_by = u.id
      WHERE ph.plant_id = $1
      ORDER BY ph.performed_at DESC
    `;
    const result = await pool.query(query, [plantId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching plant history:', err);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
};