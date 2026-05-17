import express from 'express';
import approvalsRoutes from './approvals.js';
import teamGoalsRoutes from './teamGoals.js';

const router = express.Router();

router.use(approvalsRoutes);
router.use(teamGoalsRoutes);

export default router;
