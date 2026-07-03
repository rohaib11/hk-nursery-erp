import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Database setup
import pool, { dbReady } from './db/database.js'; // dbReady is a promise that resolves when DB is ready

// Controllers & Routes
import { seedAdminUser } from './controllers/auth.controller.js';
import authRoutes from './routes/auth.js';
import plantRoutes from './routes/plants.js';
import expenseRoutes from './routes/expenses.js';
import customerRoutes from './routes/customers.js';
import invoiceRoutes from './routes/invoices.js';
import supplierRoutes from './routes/suppliers.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ─── AUTO-CREATE UPLOAD DIRECTORIES ───
const directories = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/plants'),
  path.join(__dirname, 'uploads/receipts'),
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// ─── MIDDLEWARE ───
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // React dev servers
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── STATIC FILE SERVING ───
app.use('/uploads/plants', express.static(path.join(__dirname, 'uploads/plants')));
app.use('/uploads/receipts', express.static(path.join(__dirname, 'uploads/receipts')));

// ─── ROUTES ───
app.get('/', (req, res) => {
  res.send('🌱 Nursery Management API is running...');
});


// ─── CORE API ROUTING DOMAINS ───
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/customers', customerRoutes); // 🆕 Connected Customers
app.use('/api/invoices', invoiceRoutes);   // 🆕 Connected Billing & Invoices
app.use('/api/suppliers', supplierRoutes); // 🆕 Connected Suppliers (Accounts Payable)
app.use('/api/reports', reportRoutes); // 🆕 Connected Advanced Reports & Analytics
app.use('/api/dashboard', dashboardRoutes); // 🆕 Connected Home Dashboard
app.use('/api/settings', settingsRoutes);

// ─── GLOBAL ERROR HANDLER ───
app.use((err, req, res, next) => {
  console.error('💥 Uncaught Error:', err.stack);
  // Handle Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.',
  });
});

// ─── START SERVER AFTER DB IS READY ───
const startServer = async () => {
  try {
    // Wait for database tables to be created
    await dbReady;
    console.log('✅ Database verified and ready.');

    // Seed default admin if no users exist
    await seedAdminUser();

    // Launch Express
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  }
};

startServer();

export default app;