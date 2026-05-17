import express from 'express';
import { addUser, editUser, updateEmployeeManager } from '../../controller/admin/people.js';

const router = express.Router();

router.post('/users', addUser);
router.patch('/users/:id', editUser);
router.patch('/users/:employeeId/manager', updateEmployeeManager);

export default router;
