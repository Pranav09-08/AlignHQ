import express from 'express';
import { addTeam, editTeam } from '../../controller/admin/teams.js';

const router = express.Router();

router.post('/teams', addTeam);
router.patch('/teams/:id', editTeam);

export default router;
