import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

export async function getTeamGoalSheets(managerId, cycleId) {
  ensureSupabase();
  // Fetch employees under this manager, and their goal sheets for the active cycle
  const { data: employees, error: empError } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('manager_id', managerId);

  if (empError) throw empError;

  if (!employees || employees.length === 0) return [];

  const employeeIds = employees.map(e => e.id);

  const { data: sheets, error: sheetsError } = await supabase
    .from('goal_sheets')
    .select('*, users!goal_sheets_employee_id_fkey(name, email), goals(*)')
    .in('employee_id', employeeIds)
    .eq('cycle_id', cycleId);

  if (sheetsError) throw sheetsError;
  return sheets || [];
}

export async function updateGoalSheetStatus(sheetId, payload) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('goal_sheets')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', sheetId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
