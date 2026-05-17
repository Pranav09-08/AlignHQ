import express from 'express';
import { getMyGoals, submitSheet, reopenSheet } from '../../controller/employee/goalSheets.js';
import { addGoal, editGoal, removeGoal, adjustSharedWeightage } from '../../controller/employee/goals.js';
import { getCheckins, saveCheckin } from '../../controller/employee/checkins.js';

const router = express.Router();

router.get('/my-goals', getMyGoals);
router.post('/goals/add', addGoal);
router.put('/goals/:goalId', editGoal);
router.delete('/goals/:goalId', removeGoal);
router.post('/sheets/:sheetId/submit', submitSheet);
router.post('/sheets/:sheetId/reopen', reopenSheet);
router.get('/checkins', getCheckins);
router.post('/checkins/:goalId', saveCheckin);
router.patch('/shared-goals/:sharedGoalId/weightage', adjustSharedWeightage);

export default router;
