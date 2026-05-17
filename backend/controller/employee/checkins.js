import { getActiveCycle } from '../../model/employee/cycles.js';
import { getGoalAchievements, upsertGoalAchievement } from '../../model/employee/checkins.js';

export async function getCheckins(req, res) {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.status(400).json({ error: 'Employee ID is required' });

    const cycle = await getActiveCycle();
    if (!cycle) return res.json({ success: true, cycle: null, sheet: null, achievements: [] });

    const { sheet, achievements } = await getGoalAchievements(employeeId, cycle.id);
    res.json({ success: true, cycle, sheet, achievements });
  } catch (error) {
    console.error('get checkins error:', error);
    res.status(500).json({ error: 'Failed to load checkins' });
  }
}

export async function saveCheckin(req, res) {
  try {
    const { goalId } = req.params;
    const { cycleId, actual_achievement, achievement_status, progress_score } = req.body;

    if (!goalId || !cycleId) return res.status(400).json({ error: 'Goal ID and Cycle ID are required' });

    const achievement = await upsertGoalAchievement({
      goal_id: goalId,
      cycle_id: cycleId,
      actual_achievement: actual_achievement ?? null,
      achievement_status: achievement_status || 'not_started',
      progress_score: progress_score ?? 0,
      updated_at: new Date().toISOString(),
    });

    res.json({ success: true, achievement });
  } catch (error) {
    console.error('save checkin error:', error);
    res.status(500).json({ error: error.message || 'Failed to save check-in' });
  }
}
