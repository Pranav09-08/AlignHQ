import { createDepartment, updateDepartment } from '../../model/admin/departments.js';

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
