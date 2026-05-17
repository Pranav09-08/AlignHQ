import express from 'express';
import {
  addCycle,
  addDepartment,
  addKpiTemplate,
  addTeam,
  addUser,
  getBootstrap,
  listCycles,
  listReports,
  setCycleRules,
  updateEmployeeManager,
  editDepartment,
  editTeam,
  editUser,
  editCycle,
} from '../../controller/admin/org.js';

const router = express.Router();

router.get('/bootstrap', getBootstrap);
router.get('/cycles', listCycles);
router.get('/reports', listReports);
router.post('/departments', addDepartment);
router.patch('/departments/:id', editDepartment);
router.post('/teams', addTeam);
router.patch('/teams/:id', editTeam);
router.post('/users', addUser);
router.patch('/users/:id', editUser);
router.patch('/users/:employeeId/manager', updateEmployeeManager);
router.post('/cycles', addCycle);
router.patch('/cycles/:id', editCycle);
router.post('/cycle-rules', setCycleRules);
router.post('/kpi-templates', addKpiTemplate);

export default router;
