import express from 'express';
import { getAllInvoices, createInvoice } from '../controllers/invoices.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllInvoices);
router.post('/', createInvoice);

export default router;