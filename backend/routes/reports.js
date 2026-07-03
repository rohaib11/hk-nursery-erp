import express from 'express';
import { getDashboardMetrics, getInvoiceHistory } from '../controllers/reports.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Protect these highly sensitive financial routes
router.use(authMiddleware);

// Get the master dashboard data
router.get('/dashboard', getDashboardMetrics);

// Get the historical ledger of all printed bills
router.get('/history', getInvoiceHistory);

export default router;