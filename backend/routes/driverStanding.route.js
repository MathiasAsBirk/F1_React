import express from 'express';
import {
  getAllDriverStandings,
  getDriverStandingById,
  createDriverStanding,
  updateDriverStanding,
  deleteDriverStanding
} from '../handlers/driverStanding.handler.js';

const router = express.Router();

router.get('/', getAllDriverStandings);
router.get('/:id', getDriverStandingById);
router.post('/', createDriverStanding);
router.put('/:id', updateDriverStanding);
router.delete('/:id', deleteDriverStanding);

export default router;
