import express from 'express';
import { getAllCustomers, createCustomer, addCustomerPayment } from '../controllers/customers.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllCustomers);
router.post('/', createCustomer);
router.post('/:customer_id/payments', addCustomerPayment);

export default router;