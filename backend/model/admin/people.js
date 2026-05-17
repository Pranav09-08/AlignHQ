import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

export async function createUser(payload) {
  ensureSupabase();
  return supabase.from('users').insert(payload).select('id, name, email, role, manager_id, department_id, team_id').single();
}

export async function updateUser(id, payload) {
  ensureSupabase();
  return supabase.from('users').update(payload).eq('id', id).select('id, name, email, role, manager_id, department_id, team_id').single();
}

export async function assignManagerToEmployee(employeeId, managerId) {
  ensureSupabase();
  return supabase
    .from('users')
    .update({ manager_id: managerId || null })
    .eq('id', employeeId)
    .select(
      'id, name, email, role, manager_id, department_id, team_id, departments(id, name), teams!users_team_id_fkey(id, name)'
    )
    .single();
}
