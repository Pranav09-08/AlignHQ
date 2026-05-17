import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

export async function getGoalAchievements(employeeId, cycleId) {
  ensureSupabase();

  // Get employee's goal sheet with goals for this cycle
  const { data: sheet, error: sheetError } = await supabase
    .from('goal_sheets')
    .select('id, status, goals(*)')
    .eq('employee_id', employeeId)
    .eq('cycle_id', cycleId)
    .single();

  if (sheetError && sheetError.code !== 'PGRST116') throw sheetError;
  if (!sheet) return { sheet: null, achievements: [] };

  const goalIds = (sheet.goals || []).map(g => g.id);
  if (goalIds.length === 0) return { sheet, achievements: [] };

  const { data: achievements, error: achError } = await supabase
    .from('goal_achievements')
    .select('*')
    .in('goal_id', goalIds)
    .eq('cycle_id', cycleId);

  if (achError) throw achError;
  return { sheet, achievements: achievements || [] };
}

export async function upsertGoalAchievement(payload) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('goal_achievements')
    .upsert(payload, { onConflict: 'goal_id,cycle_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
