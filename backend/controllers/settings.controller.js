import pool from '../db/database.js';

// 🏢 GET BUSINESS SETTINGS
export const getBusinessSettings = async (req, res) => {
  try {
    // Ensure default settings exist
    await ensureSettingsExist();

    const result = await pool.query('SELECT key, value FROM settings ORDER BY key');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json({ success: true, settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch business settings.' });
  }
};

// 🏢 UPDATE BUSINESS SETTINGS
export const updateBusinessSettings = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updates = req.body; // e.g., { nursery_name: "HK Nursery", phone1: "0300-1234567", ... }
    const validKeys = [
      'nursery_name',
      'address',
      'phone1',
      'phone2',
      'email',
      'website',
      'invoice_header_message',
      'invoice_footer_message'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (!validKeys.includes(key)) continue;

      // Upsert: insert or update on conflict
      await client.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2`,
        [key, value]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  } finally {
    client.release();
  }
};

// Helper: ensure default settings exist if table is empty
const ensureSettingsExist = async () => {
  const countRes = await pool.query('SELECT COUNT(*) as count FROM settings');
  const rowCount = parseInt(countRes.rows[0].count, 10);

  if (rowCount === 0) {
    const defaults = {
      nursery_name: 'HK Nursery',
      address: 'Pattoki, Punjab, Pakistan',
      phone1: '+92 300 1234567',
      phone2: '+92 300 7654321',
      email: '',
      website: '',
      invoice_header_message: '',
      invoice_footer_message: 'Thank you for your business!'
    };

    const insertStmt = 'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING';
    for (const [key, value] of Object.entries(defaults)) {
      await pool.query(insertStmt, [key, value]);
    }
  }
};