import { createKpiTemplate } from '../../model/admin/kpiTemplates.js';

export async function addKpiTemplate(req, res) {
  try {
    const { created_by = null, scope, department_id = null, team_id = null, cycle_id = null, title, description = null, thrust_area = null, uom_type, target = null, unit = null, default_weightage = 10, is_shared = true, is_active = true } = req.body;

    if (!scope || !title || !uom_type) {
      return res.status(400).json({ error: 'Scope, title, and UOM type are required' });
    }

    const normalizedDepartmentId = department_id === '' ? null : department_id;
    const normalizedTeamId = team_id === '' ? null : team_id;
    const normalizedCycleId = cycle_id === '' ? null : cycle_id;

    const { data, error } = await createKpiTemplate({
      created_by,
      scope,
      department_id: normalizedDepartmentId,
      team_id: normalizedTeamId,
      cycle_id: normalizedCycleId,
      title,
      description,
      thrust_area,
      uom_type,
      target,
      unit,
      default_weightage,
      is_shared,
      is_active,
    });
    if (error) throw error;

    res.status(201).json({ success: true, kpi_template: data });
  } catch (error) {
    console.error('Create KPI template error:', error);
    res.status(500).json({ error: error.message || 'Failed to create KPI template' });
  }
}
