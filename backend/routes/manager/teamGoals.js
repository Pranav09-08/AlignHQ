import express from 'express';
import { listTeamGoals } from '../../controller/manager/teamGoals.js';

const router = express.Router();

router.get('/team-goals', listTeamGoals);

export default router;
