import express from 'express';
import { getBootstrap, listReports } from '../../controller/admin/organization.js';

const router = express.Router();

router.get('/bootstrap', getBootstrap);
router.get('/reports', listReports);

export default router;
