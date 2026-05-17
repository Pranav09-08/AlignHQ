import { supabase } from '../../config/db.js';

function ensureSupabase() {
  if (!supabase) throw new Error('Supabase client is not configured');
}

export async function getActiveCycle() {
  ensureSupabase();
  const { data, error } = await supabase
    .from('cycles')
    .select('*, cycle_rules(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getGoalSheet(employeeId, cycleId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('goal_sheets')
    .select('*, goals(*)')
    .eq('employee_id', employeeId)
    .eq('cycle_id', cycleId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createGoalSheet(payload) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('goal_sheets')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function createGoal(payload) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('goals')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateGoal(goalId, payload) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('goals')
    .update(payload)
    .eq('id', goalId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGoal(goalId) {
  ensureSupabase();
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);

  if (error) throw error;
  return true;
}

export async function updateGoalSheetStatus(sheetId, payload) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('goal_sheets')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', sheetId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
