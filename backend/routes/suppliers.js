import express from 'express';
import { getAllSuppliers, createSupplier, addSupplierPayment } from '../controllers/suppliers.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllSuppliers);
router.post('/', createSupplier);
router.post('/:supplier_id/payments', addSupplierPayment);

export default router;