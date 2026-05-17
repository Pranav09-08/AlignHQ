import express from 'express';
import { getTeamApprovals, reviewSheet, editEmployeeGoalByManager } from '../../controller/manager/approvals.js';

const router = express.Router();

router.get('/approvals', getTeamApprovals);
router.get('/pending-approvals', getTeamApprovals);
router.post('/approvals/:sheetId/review', reviewSheet);
router.put('/goals/:goalId', editEmployeeGoalByManager);

export default router;
