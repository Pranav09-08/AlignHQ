import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

export async function upsertCycleRules(payload) {
  ensureSupabase();
  return supabase.from('cycle_rules').upsert(payload, { onConflict: 'cycle_id' }).select('*, cycles(id, name, phase, status)').single();
}
