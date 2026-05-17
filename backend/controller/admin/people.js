import bcrypt from 'bcrypt';
import { assignManagerToEmployee, createUser, updateUser } from '../../model/admin/people.js';

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
