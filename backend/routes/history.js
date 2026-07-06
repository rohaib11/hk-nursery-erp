import express from 'express';
import { getPlantHistory } from '../controllers/history.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET history for a specific plant
router.get('/:plantId', getPlantHistory);

export default router;