import pool from './db/database.js';
import bcrypt from 'bcryptjs';

const rebuildTable = async () => {
    try {
        console.log("⚠️ Dropping old users table...");
        await pool.query('DROP TABLE IF EXISTS users CASCADE;');

        console.log("🏗️ Creating new users table...");
        await pool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role VARCHAR(20) DEFAULT 'worker',
                security_question VARCHAR(255),
                security_answer VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("👤 Seeding new admin account...");
        const hashedPw = await bcrypt.hash('admin123', 10);
        const hashedAns = await bcrypt.hash('nursery', 10);

        await pool.query(`
            INSERT INTO users (username, password_hash, full_name, role, security_question, security_answer)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, ['admin', hashedPw, 'System Owner', 'owner', 'What is your favorite word?', hashedAns]);

        console.log("✅ Table rebuilt successfully! Username: admin | Password: admin123");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to rebuild:", err.message);
        process.exit(1);
    }
};

rebuildTable();