import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

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

export async function getGoalSheetById(sheetId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('goal_sheets')
    .select('*')
    .eq('id', sheetId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
