// backend/routes/settings.js
import express from 'express';
import { getBusinessSettings, updateBusinessSettings } from '../controllers/settings.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getBusinessSettings);
router.put('/', updateBusinessSettings);

export default router;