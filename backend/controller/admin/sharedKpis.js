import {
  createGoal,
  createGoalSheet,
  createSharedGoal,
  getActiveCycle,
  getExistingSharedGoal,
  getGoalSheet,
  getKpiTemplateById,
  getTeamMembers,
} from '../../model/admin/sharedKpis.js';

export async function shareTeamKpiTemplate(req, res) {
  try {
    const { id } = req.params;
    const { cycle_id: cycleIdOverride = null } = req.body || {};

    const template = await getKpiTemplateById(id);
    if (!template) return res.status(404).json({ error: 'KPI template not found' });

    if (!template.is_shared) return res.status(400).json({ error: 'Template is not marked as shared' });
    if (!template.is_active) return res.status(400).json({ error: 'Template is inactive' });
    if (template.scope !== 'team' || !template.team_id) {
      return res.status(400).json({ error: 'Template scope must be team' });
    }

    const cycle = cycleIdOverride ? { id: cycleIdOverride } : await getActiveCycle();
    if (!cycle?.id) return res.status(400).json({ error: 'No active cycle found' });

    const members = await getTeamMembers(template.team_id);
    if (!members.length) {
      return res.status(200).json({ success: true, assigned: 0, skipped: 0 });
    }

    let assigned = 0;
    let skipped = 0;

    for (const member of members) {
      const existing = await getExistingSharedGoal(member.id, template.id, cycle.id);
      if (existing) {
        skipped += 1;
        continue;
      }

      let sheet = await getGoalSheet(member.id, cycle.id);
      if (!sheet) {
        sheet = await createGoalSheet({ employee_id: member.id, cycle_id: cycle.id, status: 'draft' });
      }

      const goal = await createGoal({
        goal_sheet_id: sheet.id,
        title: template.title,
        description: template.description,
        thrust_area: template.thrust_area,
        uom_type: template.uom_type,
        target: template.target,
        unit: template.unit,
        weightage: template.default_weightage,
        status: 'active',
      });

      await createSharedGoal({
        parent_goal_id: goal.id,
        kpi_template_id: template.id,
        assigned_to_user_id: member.id,
        cycle_id: cycle.id,
        can_adjust_weightage: true,
        status: 'active',
      });

      assigned += 1;
    }

    res.json({ success: true, assigned, skipped });
  } catch (error) {
    console.error('Share KPI template error:', error);
    res.status(500).json({ error: error.message || 'Failed to share KPI template' });
  }
}
