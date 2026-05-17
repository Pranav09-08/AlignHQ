import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

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
