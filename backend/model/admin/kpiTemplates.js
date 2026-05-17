import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

export async function createKpiTemplate(payload) {
  ensureSupabase();
  return supabase.from('kpi_templates').insert(payload).select('*, departments(id, name), teams(id, name), cycles(id, name, phase)').single();
}
