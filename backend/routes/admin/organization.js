import express from 'express';
import { getBootstrap, listReports, exportAchievementReport, getEscalations } from '../../controller/admin/organization.js';

const router = express.Router();

router.get('/bootstrap', getBootstrap);
router.get('/reports', listReports);
router.get('/reports/export', exportAchievementReport);
router.get('/escalations', getEscalations);

export default router;
