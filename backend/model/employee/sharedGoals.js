import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

export async function getSharedGoalsForEmployee(employeeId, cycleId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('shared_goals')
    .select('id, parent_goal_id, can_adjust_weightage, kpi_template_id')
    .eq('assigned_to_user_id', employeeId)
    .eq('cycle_id', cycleId);

  if (error) throw error;
  return data || [];
}

export async function getSharedGoalByParentGoalId(goalId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('shared_goals')
    .select('id, can_adjust_weightage')
    .eq('parent_goal_id', goalId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateSharedGoalWeightage(sharedGoalId, weightage) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('shared_goals')
    .update({ weightage_adjusted: weightage, updated_at: new Date().toISOString() })
    .eq('id', sharedGoalId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
