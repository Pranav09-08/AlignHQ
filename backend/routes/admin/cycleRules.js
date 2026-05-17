import express from 'express';
import { setCycleRules } from '../../controller/admin/cycleRules.js';

const router = express.Router();

router.post('/cycle-rules', setCycleRules);

export default router;
