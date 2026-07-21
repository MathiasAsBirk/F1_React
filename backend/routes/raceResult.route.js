import express from 'express';
import {
  getAllRaceResults,
  getRaceResultById,
  createRaceResult,
  updateRaceResult,
  deleteRaceResult
} from '../handlers/raceResult.handler.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllRaceResults);
router.get('/:id', getRaceResultById);
router.post('/', requireAdmin, createRaceResult);
router.put('/:id', requireAdmin, updateRaceResult);
router.delete('/:id', requireAdmin, deleteRaceResult);

export default router;
