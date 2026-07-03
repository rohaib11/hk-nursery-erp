import express from 'express';
import { getHomeSummary } from '../controllers/dashboard.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/summary', getHomeSummary);

export default router;