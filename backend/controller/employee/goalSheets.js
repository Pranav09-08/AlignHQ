import { getActiveCycle } from '../../model/employee/cycles.js';
import { getGoalSheet, getGoalSheetById, updateGoalSheetStatus } from '../../model/employee/goalSheets.js';
import { getSharedGoalsForEmployee } from '../../model/employee/sharedGoals.js';

export async function getMyGoals(req, res) {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.status(400).json({ error: 'Employee ID is required' });

    const cycle = await getActiveCycle();
    if (!cycle) return res.json({ success: true, cycle: null, sheet: null, sharedGoals: [] });

    const sheet = await getGoalSheet(employeeId, cycle.id);
    const sharedGoals = await getSharedGoalsForEmployee(employeeId, cycle.id);
    res.json({ success: true, cycle, sheet, sharedGoals });
  } catch (error) {
    console.error('get my goals error:', error);
    res.status(500).json({ error: 'Failed to load goals' });
  }
}

export async function submitSheet(req, res) {
  try {
    const { sheetId } = req.params;
    const sheet = await updateGoalSheetStatus(sheetId, { status: 'submitted', submitted_at: new Date().toISOString() });
    res.json({ success: true, sheet });
  } catch (error) {
    console.error('submit sheet error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit goals' });
  }
}

export async function reopenSheet(req, res) {
  try {
    const { sheetId } = req.params;
    const existing = await getGoalSheetById(sheetId);
    if (!existing) return res.status(404).json({ error: 'Sheet not found' });
    if (existing.status !== 'rejected') return res.status(400).json({ error: 'Only rejected sheets can be reopened' });
    const sheet = await updateGoalSheetStatus(sheetId, { status: 'draft', submitted_at: null, rejection_reason: null });
    res.json({ success: true, sheet });
  } catch (error) {
    console.error('reopen sheet error:', error);
    res.status(500).json({ error: error.message || 'Failed to reopen sheet' });
  }
}
