import express from 'express';
import {
  getMyGoals,
  addGoal,
  editGoal,
  removeGoal,
  submitSheet,
} from '../../controller/employee/myGoals.js';

const router = express.Router();

router.get('/my-goals', getMyGoals);
router.post('/goals/add', addGoal);
router.put('/goals/:goalId', editGoal);
router.delete('/goals/:goalId', removeGoal);
router.post('/sheets/:sheetId/submit', submitSheet);

export default router;
