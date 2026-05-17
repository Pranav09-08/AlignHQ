import express from 'express';
import { listTeamGoals, saveTeamCheckinComment } from '../../controller/manager/teamGoals.js';

const router = express.Router();

router.get('/team-goals', listTeamGoals);
router.post('/team-goals/:goalId/checkin-comment', saveTeamCheckinComment);

export default router;
