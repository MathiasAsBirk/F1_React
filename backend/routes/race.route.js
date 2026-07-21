import express from 'express';
import {
  getAllRaces,
  getRaceById,
  createRace,
  updateRace,
  deleteRace
} from '../handlers/race.handler.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

function validateRaceDates(req, res, next) {
  const startDate = new Date(req.body?.startDate);
  const endDate = new Date(req.body?.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return res.status(400).json({ message: "Valid startDate and endDate values are required." });
  }
  if (endDate < startDate) {
    return res.status(400).json({ message: "endDate must be on or after startDate." });
  }
  return next();
}

router.get('/', getAllRaces);
router.get('/:id', getRaceById);
router.post('/', requireAdmin, validateRaceDates, createRace);
router.put('/:id', requireAdmin, validateRaceDates, updateRace);
router.delete('/:id', requireAdmin, deleteRace);

export default router;
