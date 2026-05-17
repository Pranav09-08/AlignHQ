import { supabase } from '../../config/db.js';

export function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }
}

function isMissingTableError(error) {
  return error?.code === 'PGRST205' || /could not find the table/i.test(error?.message || '');
}

export async function safeSelect(queryPromise, fallbackData = []) {
  const { data, error, count } = await queryPromise;
  if (error) {
    if (isMissingTableError(error)) {
      return { data: fallbackData, error: null, count: count ?? fallbackData.length };
    }
    return { data, error, count };
  }
  return { data, error: null, count };
}
