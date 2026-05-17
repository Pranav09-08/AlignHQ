import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

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
