import express from 'express';
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
} from '../handlers/team.handler.js';

const router = express.Router();

router.get('/', getAllTeams);             
router.get('/:id', getTeamById);          
router.post('/', createTeam);             
router.put('/:id', updateTeam);           
router.delete('/:id', deleteTeam);      

export default router;
