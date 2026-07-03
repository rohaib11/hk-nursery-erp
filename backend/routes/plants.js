import express from 'express';
import {
  getAllPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
  logPlantMortality // 🆕 Newly added function
} from '../controllers/plants.controller.js';
import authMiddleware from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes below require authentication
router.use(authMiddleware);

// GET all plants (with category info)
router.get('/', getAllPlants);

// GET single plant by ID (optional, not used by frontend currently)
router.get('/:id', getPlantById);

// POST create new plant (with optional image upload)
// 'image' is the field name used in the frontend FormData
router.post('/', upload.single('image'), createPlant);

// PUT update plant by ID (with optional image upload)
router.put('/:id', upload.single('image'), updatePlant);

// DELETE a plant (Complete removal)
router.delete('/:id', deletePlant);

// 🆕 POST log partial mortality (Deduct specific dead plants from stock)
router.post('/:id/mortality', logPlantMortality);

export default router;