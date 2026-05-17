import { upsertCycleRules } from '../../model/admin/cycleRules.js';

export async function setCycleRules(req, res) {
  try {
    const { cycle_id, rule_name, description = null, min_goal_weightage = 10, max_goals_per_sheet = 8, allow_edit_after_submission = false, shared_kpi_enabled = true, checkin_window_start = null, checkin_window_end = null } = req.body;

    if (!cycle_id || !rule_name) {
      return res.status(400).json({ error: 'Cycle and rule name are required' });
    }

    const payload = {
      cycle_id,
      rule_name,
      description,
      min_goal_weightage,
      max_goals_per_sheet,
      allow_edit_after_submission,
      shared_kpi_enabled,
      checkin_window_start,
      checkin_window_end,
    };

    const { data, error } = await upsertCycleRules(payload);
    if (error) throw error;

    res.status(201).json({ success: true, cycle_rule: data });
  } catch (error) {
    console.error('Set cycle rules error:', error);
    res.status(500).json({ error: error.message || 'Failed to save cycle rules' });
  }
}
