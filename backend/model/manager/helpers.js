import { supabase } from '../../config/db.js';

export function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }
}
