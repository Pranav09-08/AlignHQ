import { getTeamGoalSheets, updateGoalSheetStatus } from '../../model/manager/approvals.js';
import { getActiveCycle } from '../../model/manager/cycles.js';
import { updateGoal } from '../../model/employee/goals.js';


export async function getTeamApprovals(req, res) {
  try {
    const { managerId } = req.query;
    if (!managerId) return res.status(400).json({ error: 'Manager ID is required' });

    const cycle = await getActiveCycle();
    if (!cycle) return res.json({ success: true, sheets: [] });

    const sheets = await getTeamGoalSheets(managerId, cycle.id);
    res.json({ success: true, cycle, sheets });
  } catch (error) {
    console.error('get team approvals error:', error);
    res.status(500).json({ error: 'Failed to load team approvals' });
  }
}

export async function reviewSheet(req, res) {
  try {
    const { sheetId } = req.params;
    const { action, reviewerId, rejectionReason } = req.body; // action: 'approve' | 'reject'

    if (action === 'approve') {
      const sheet = await updateGoalSheetStatus(sheetId, { 
        status: 'approved', 
        reviewed_at: new Date().toISOString(),
        reviewer_id: reviewerId,
        locked_at: new Date().toISOString()
      });
      res.json({ success: true, sheet });
    } else if (action === 'reject') {
      const sheet = await updateGoalSheetStatus(sheetId, { 
        status: 'rejected', 
        reviewed_at: new Date().toISOString(),
        reviewer_id: reviewerId,
        rejection_reason: rejectionReason
      });
      res.json({ success: true, sheet });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('review sheet error:', error);
    res.status(500).json({ error: error.message || 'Failed to review sheet' });
  }
}

export async function editEmployeeGoalByManager(req, res) {
  try {
    const { goalId } = req.params;
    const { target, weightage } = req.body;

    if (weightage !== undefined && Number(weightage) < 10) {
      return res.status(400).json({ error: 'Minimum weightage is 10%' });
    }

    const payload = {};
    if (target !== undefined) payload.target = target === '' ? null : Number(target);
    if (weightage !== undefined) payload.weightage = Number(weightage);

    const goal = await updateGoal(goalId, payload);
    res.json({ success: true, goal });
  } catch (error) {
    console.error('manager edit goal error:', error);
    res.status(500).json({ error: error.message || 'Failed to update employee goal' });
  }
}
