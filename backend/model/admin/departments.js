import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

export async function createDepartment(payload) {
  ensureSupabase();
  return supabase.from('departments').insert(payload).select('*').single();
}

export async function updateDepartment(id, payload) {
  ensureSupabase();
  return supabase.from('departments').update(payload).eq('id', id).select('*').single();
}
