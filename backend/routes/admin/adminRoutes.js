import express from 'express';
import organizationRoutes from './organization.js';
import departmentRoutes from './departments.js';
import teamRoutes from './teams.js';
import peopleRoutes from './people.js';
import cycleRoutes from './cycles.js';
import cycleRulesRoutes from './cycleRules.js';
import kpiTemplateRoutes from './kpiTemplates.js';

const router = express.Router();

router.use(organizationRoutes);
router.use(departmentRoutes);
router.use(teamRoutes);
router.use(peopleRoutes);
router.use(cycleRoutes);
router.use(cycleRulesRoutes);
router.use(kpiTemplateRoutes);

export default router;
