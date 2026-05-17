import express from 'express';
import { getTeamApprovals, reviewSheet } from '../../controller/manager/approvals.js';

const router = express.Router();

router.get('/approvals', getTeamApprovals);
router.get('/pending-approvals', getTeamApprovals);
router.post('/approvals/:sheetId/review', reviewSheet);

export default router;
