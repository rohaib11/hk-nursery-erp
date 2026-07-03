import express from 'express';
import {
  login,
  getSecurityQuestion,
  resetPassword,
  getMe,
  updateMe,
  changePassword
} from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.get('/security-question/:username', getSecurityQuestion);
router.post('/reset-password', resetPassword);

// Protected routes (require JWT)
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.put('/change-password', authMiddleware, changePassword);

export default router;