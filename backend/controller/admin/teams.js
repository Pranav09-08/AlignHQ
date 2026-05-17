import { createTeam, updateTeam } from '../../model/admin/teams.js';

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
