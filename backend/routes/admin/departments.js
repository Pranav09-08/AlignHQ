import express from 'express';
import { addDepartment, editDepartment } from '../../controller/admin/departments.js';

const router = express.Router();

router.post('/departments', addDepartment);
router.patch('/departments/:id', editDepartment);

export default router;
