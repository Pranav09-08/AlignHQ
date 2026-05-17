import { getActiveCycle } from '../../model/manager/cycles.js';
import { getTeamGoals } from '../../model/manager/teamGoals.js';

import { supabase } from '../../config/db.js';
import { ensureSupabase } from '../../model/manager/helpers.js';

export async function listTeamGoals(req, res) {
  try {
    const { manager_id: managerId } = req.query;
    if (!managerId) return res.status(400).json({ error: 'Manager ID is required' });

    const cycle = await getActiveCycle();
    if (!cycle) return res.json({ success: true, cycle: null, goals: [] });

    const goals = await getTeamGoals(managerId, cycle.id);
    res.json({ success: true, cycle, goals });
  } catch (error) {
    console.error('list team goals error:', error);
    res.status(500).json({ error: error.message || 'Failed to load team goals' });
  }
}

export async function saveTeamCheckinComment(req, res) {
  try {
    const { goalId } = req.params;
    const { managerId, comment, cycleId, sheetId } = req.body;

    if (!goalId || !managerId || !cycleId || !sheetId || !comment) {
      return res.status(400).json({ error: 'Missing required check-in fields' });
    }

    ensureSupabase();

    // 1. Find or create checkin record for this manager, sheet, and cycle
    let { data: checkin, error: checkinErr } = await supabase
      .from('checkins')
      .select('*')
      .eq('goal_sheet_id', sheetId)
      .eq('cycle_id', cycleId)
      .eq('manager_id', managerId)
      .maybeSingle();

    if (checkinErr) throw checkinErr;

    if (!checkin) {
      const { data: newCheckin, error: createCheckinErr } = await supabase
        .from('checkins')
        .insert({
          goal_sheet_id: sheetId,
          cycle_id: cycleId,
          manager_id: managerId,
          completed_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (createCheckinErr) throw createCheckinErr;
      checkin = newCheckin;
    }

    // 2. Insert checkin_comment
    const { data: newComment, error: commentErr } = await supabase
      .from('checkin_comments')
      .insert({
        checkin_id: checkin.id,
        goal_id: goalId,
        comment
      })
      .select('*')
      .single();

    if (commentErr) throw commentErr;

    res.json({ success: true, comment: newComment });
  } catch (error) {
    console.error('save team checkin comment error:', error);
    res.status(500).json({ error: error.message || 'Failed to save check-in comment' });
  }
}
