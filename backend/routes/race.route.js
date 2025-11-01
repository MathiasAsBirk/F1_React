import express from 'express';
import {
  getAllRaces,
  getRaceById,
  createRace,
  updateRace,
  deleteRace
} from '../handlers/race.handler.js';

const router = express.Router();

router.get('/', getAllRaces);
router.get('/:id', getRaceById);
router.post('/', createRace);
router.put('/:id', updateRace);
router.delete('/:id', deleteRace);

export default router;
