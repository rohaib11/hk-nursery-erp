import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Utility to get current directory in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Create the PostgreSQL Connection Pool
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'nursery_db',
    password: process.env.DB_PASS || 'postgres',
    port: process.env.DB_PORT || 5432,
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

// 2. Auto-Initialize the Database
const initializeDatabase = async () => {
    try {
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log("🌱 First run detected! Building PostgreSQL tables...");
            const schemaPath = path.join(__dirname, '../schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await pool.query(schema);
            console.log("✅ V3 PostgreSQL Database initialized successfully!");
        } else {
            console.log("✅ PostgreSQL connection established and tables verified.");
        }
    } catch (error) {
        console.error("❌ Failed to initialize database:", error.message);
        throw error; // re-throw so server.js can catch it
    }
};

// Export the promise so server.js can wait for DB readiness
export const dbReady = initializeDatabase();

// Export the pool for controllers
export default pool;