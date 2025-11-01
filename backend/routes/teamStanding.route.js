import express from 'express';
import {
  getAllTeamStandings,
  getTeamStandingById,
  createTeamStanding,
  updateTeamStanding,
  deleteTeamStanding
} from '../handlers/teamStanding.handler.js';

const router = express.Router();

router.get('/', getAllTeamStandings);
router.get('/:id', getTeamStandingById);
router.post('/', createTeamStanding);
router.put('/:id', updateTeamStanding);
router.delete('/:id', deleteTeamStanding);

export default router;
