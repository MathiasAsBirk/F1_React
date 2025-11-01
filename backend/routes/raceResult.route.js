import express from 'express';
import {
  getAllRaceResults,
  getRaceResultById,
  createRaceResult,
  updateRaceResult,
  deleteRaceResult
} from '../handlers/raceResult.handler.js';

const router = express.Router();

router.get('/', getAllRaceResults);
router.get('/:id', getRaceResultById);
router.post('/', createRaceResult);
router.put('/:id', updateRaceResult);
router.delete('/:id', deleteRaceResult);

export default router;
