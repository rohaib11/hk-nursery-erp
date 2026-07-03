import express from 'express';
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenses.controller.js';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Setup Multer specifically for Expense Receipts
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/receipts');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All routes below require authentication
router.use(authMiddleware);

// Routes
router.get('/', getAllExpenses);
router.post('/', upload.single('receipt'), createExpense);
router.put('/:id', upload.single('receipt'), updateExpense); // 🆕 Added Edit Route
router.delete('/:id', deleteExpense);

export default router;