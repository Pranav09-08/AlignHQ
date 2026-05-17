import {
  getActiveCycle,
  getGoalSheet,
  createGoalSheet,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalSheetStatus,
} from '../../model/employee/myGoals.js';

export async function getMyGoals(req, res) {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.status(400).json({ error: 'Employee ID is required' });

    const cycle = await getActiveCycle();
    if (!cycle) return res.json({ success: true, cycle: null, sheet: null });

    const sheet = await getGoalSheet(employeeId, cycle.id);
    res.json({ success: true, cycle, sheet });
  } catch (error) {
    console.error('get my goals error:', error);
    res.status(500).json({ error: 'Failed to load goals' });
  }
}

export async function addGoal(req, res) {
  try {
    const { employeeId, title, description, thrust_area, uom_type, target, unit, weightage } = req.body;
    if (!employeeId || !title || !uom_type || target === undefined || weightage === undefined) {
      return res.status(400).json({ error: 'Missing required goal fields' });
    }

    if (weightage < 10) {
      return res.status(400).json({ error: 'Minimum weightage per goal is 10%' });
    }

    const cycle = await getActiveCycle();
    if (!cycle) return res.status(400).json({ error: 'No active cycle found' });

    let sheet = await getGoalSheet(employeeId, cycle.id);
    if (!sheet) {
      sheet = await createGoalSheet({ employee_id: employeeId, cycle_id: cycle.id, status: 'draft' });
    } else {
      if (['submitted', 'approved'].includes(sheet.status)) {
        return res.status(400).json({ error: 'Cannot add goals to a submitted or approved sheet' });
      }
      
      const rule = cycle.cycle_rules && cycle.cycle_rules[0];
      const maxGoals = rule ? rule.max_goals_per_sheet : 8;
      
      if (sheet.goals && sheet.goals.length >= maxGoals) {
        return res.status(400).json({ error: `Maximum of ${maxGoals} goals allowed` });
      }
    }

    const goal = await createGoal({
      goal_sheet_id: sheet.id,
      title,
      description,
      thrust_area,
      uom_type,
      target,
      unit,
      weightage
    });

    res.status(201).json({ success: true, goal });
  } catch (error) {
    console.error('add goal error:', error);
    res.status(500).json({ error: error.message || 'Failed to add goal' });
  }
}

export async function editGoal(req, res) {
  try {
    const { goalId } = req.params;
    const { title, description, thrust_area, uom_type, target, unit, weightage } = req.body;

    const goal = await updateGoal(goalId, { title, description, thrust_area, uom_type, target, unit, weightage });
    res.json({ success: true, goal });
  } catch (error) {
    console.error('edit goal error:', error);
    res.status(500).json({ error: error.message || 'Failed to update goal' });
  }
}

export async function removeGoal(req, res) {
  try {
    const { goalId } = req.params;
    await deleteGoal(goalId);
    res.json({ success: true });
  } catch (error) {
    console.error('delete goal error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete goal' });
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
