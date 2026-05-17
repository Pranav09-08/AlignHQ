import express from 'express';
import { addCycle, editCycle, listCycles } from '../../controller/admin/cycles.js';

const router = express.Router();

router.get('/cycles', listCycles);
router.post('/cycles', addCycle);
router.patch('/cycles/:id', editCycle);

export default router;
