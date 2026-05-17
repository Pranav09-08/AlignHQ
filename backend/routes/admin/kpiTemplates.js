import express from 'express';
import { addKpiTemplate } from '../../controller/admin/kpiTemplates.js';
import { shareTeamKpiTemplate } from '../../controller/admin/sharedKpis.js';

const router = express.Router();

router.post('/kpi-templates', addKpiTemplate);
router.post('/kpi-templates/:id/share', shareTeamKpiTemplate);

export default router;
