import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

export async function createTeam(payload) {
  ensureSupabase();
  return supabase.from('teams').insert(payload).select('*, departments(id, name)').single();
}

export async function updateTeam(id, payload) {
  ensureSupabase();
  return supabase.from('teams').update(payload).eq('id', id).select('*, departments(id, name)').single();
}
