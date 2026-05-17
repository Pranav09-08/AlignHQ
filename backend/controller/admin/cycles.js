import { createCycle, getAdminCyclesList, updateCycle } from '../../model/admin/cycles.js';

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
