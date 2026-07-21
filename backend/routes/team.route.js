import express from 'express';
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
} from '../handlers/team.handler.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllTeams);             
router.get('/:id', getTeamById);          
router.post('/', requireAdmin, createTeam);
router.put('/:id', requireAdmin, updateTeam);
router.delete('/:id', requireAdmin, deleteTeam);

export default router;
