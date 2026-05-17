import bcrypt from 'bcrypt';
import {
  assignManagerToEmployee,
  createCycle,
  createDepartment,
  createKpiTemplate,
  createTeam,
  createUser,
  getAdminBootstrapData,
  getAdminCyclesList,
  getAdminReportsData,
  upsertCycleRules,
  updateCycle,
  updateDepartment,
  updateTeam,
  updateUser,
} from '../../model/admin/org.js';

export async function getBootstrap(req, res) {
  try {
    const data = await getAdminBootstrapData();
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Admin bootstrap error:', error);
    res.status(500).json({ error: 'Failed to load admin data' });
  }
}

export async function addDepartment(req, res) {
  try {
    const { name, description = null } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });

    const { data, error } = await createDepartment({ name, description });
    if (error) throw error;

    res.status(201).json({ success: true, department: data });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: error.message || 'Failed to create department' });
  }
}

export async function addTeam(req, res) {
  try {
    const { department_id, name, description = null, manager_id = null } = req.body;
    if (!department_id || !name) {
      return res.status(400).json({ error: 'Department and team name are required' });
    }

    const { data, error } = await createTeam({ department_id, name, description, manager_id });
    if (error) throw error;

    res.status(201).json({ success: true, team: data });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: error.message || 'Failed to create team' });
  }
}

export async function updateEmployeeManager(req, res) {
  try {
    const { employeeId } = req.params;
    const { manager_id } = req.body;

    if (!employeeId) return res.status(400).json({ error: 'Employee id is required' });

    const { data, error } = await assignManagerToEmployee(employeeId, manager_id || null);
    if (error) throw error;

    res.json({ success: true, employee: data });
  } catch (error) {
    console.error('Assign manager error:', error);
    res.status(500).json({ error: error.message || 'Failed to assign manager' });
  }
}

export async function addCycle(req, res) {
  try {
    const { name, phase, window_open = null, window_close = null, status = 'upcoming' } = req.body;
    if (!name || !phase) return res.status(400).json({ error: 'Cycle name and phase are required' });

    const { data, error } = await createCycle({ name, phase, window_open, window_close, status });
    if (error) throw error;

    res.status(201).json({ success: true, cycle: data });
  } catch (error) {
    console.error('Create cycle error:', error);
    res.status(500).json({ error: error.message || 'Failed to create cycle' });
  }
}

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

export async function editCycle(req, res) {
  try {
    const { id } = req.params;
    const { name, phase, window_open = null, window_close = null, status = 'upcoming' } = req.body;

    if (!name || !phase) return res.status(400).json({ error: 'Cycle name and phase are required' });

    const { data, error } = await updateCycle(id, { name, phase, window_open, window_close, status });
    if (error) throw error;

    res.json({ success: true, cycle: data });
  } catch (error) {
    console.error('Edit cycle error:', error);
    res.status(500).json({ error: error.message || 'Failed to update cycle' });
  }
}

export async function listCycles(_req, res) {
  try {
    const cycles = await getAdminCyclesList();
    res.json({ success: true, cycles });
  } catch (error) {
    console.error('List cycles error:', error);
    res.status(500).json({ error: error.message || 'Failed to load cycles' });
  }
}

export async function listReports(_req, res) {
  try {
    const reports = await getAdminReportsData();
    res.json({ success: true, ...reports });
  } catch (error) {
    console.error('List reports error:', error);
    res.status(500).json({ error: error.message || 'Failed to load reports' });
  }
}

export async function addUser(req, res) {
  try {
    const { name, email, role, department_id, team_id = null, manager_id = null, password = 'password123' } = req.body;

    if (!name || !email || !role || !department_id) {
      return res.status(400).json({ error: 'Name, email, role, and department are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const payload = {
      name,
      email,
      role,
      department_id,
      team_id: team_id || null,
      manager_id: manager_id || null,
      password_hash,
      is_active: true
    };

    const { data, error } = await createUser(payload);
    if (error) throw error;

    res.status(201).json({ success: true, user: data });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
}

export async function editDepartment(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });

    const { data, error } = await updateDepartment(id, { name, description });
    if (error) throw error;

    res.json({ success: true, department: data });
  } catch (error) {
    console.error('Edit department error:', error);
    res.status(500).json({ error: error.message || 'Failed to update department' });
  }
}

export async function editTeam(req, res) {
  try {
    const { id } = req.params;
    const { department_id, name, description, manager_id } = req.body;
    if (!department_id || !name) {
      return res.status(400).json({ error: 'Department and team name are required' });
    }

    const { data, error } = await updateTeam(id, { department_id, name, description, manager_id: manager_id || null });
    if (error) throw error;

    res.json({ success: true, team: data });
  } catch (error) {
    console.error('Edit team error:', error);
    res.status(500).json({ error: error.message || 'Failed to update team' });
  }
}

export async function editUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, department_id, team_id, manager_id } = req.body;

    if (!name || !email || !role || !department_id) {
      return res.status(400).json({ error: 'Name, email, role, and department are required' });
    }

    const payload = {
      name,
      email,
      role,
      department_id,
      team_id: team_id || null,
      manager_id: manager_id || null,
    };

    const { data, error } = await updateUser(id, payload);
    if (error) throw error;

    res.json({ success: true, user: data });
  } catch (error) {
    console.error('Edit user error:', error);
    res.status(500).json({ error: error.message || 'Failed to update user' });
  }
}
