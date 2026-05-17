import { supabase } from '../../config/db.js';
import { ensureSupabase, safeSelect } from './helpers.js';

export async function getAdminCyclesList() {
  ensureSupabase();

  const { data, error } = await safeSelect(supabase.from('cycles').select('*').order('created_at', { ascending: false }));
  if (error) throw error;
  return data || [];
}

export async function createCycle(payload) {
  ensureSupabase();
  return supabase.from('cycles').insert(payload).select('*').single();
}

export async function updateCycle(id, payload) {
  ensureSupabase();
  return supabase.from('cycles').update(payload).eq('id', id).select('*').single();
}
