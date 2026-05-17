import { getActiveCycle } from '../../model/manager/cycles.js';
import { getTeamGoals } from '../../model/manager/teamGoals.js';

export async function listTeamGoals(req, res) {
  try {
    const { manager_id: managerId } = req.query;
    if (!managerId) return res.status(400).json({ error: 'Manager ID is required' });

    const cycle = await getActiveCycle();
    if (!cycle) return res.json({ success: true, cycle: null, goals: [] });

    const goals = await getTeamGoals(managerId, cycle.id);
    res.json({ success: true, cycle, goals });
  } catch (error) {
    console.error('list team goals error:', error);
    res.status(500).json({ error: error.message || 'Failed to load team goals' });
  }
}
