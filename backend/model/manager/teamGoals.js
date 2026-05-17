import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

export async function getTeamGoals(managerId, cycleId) {
  ensureSupabase();

  const { data: employees, error: empError } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('manager_id', managerId);

  if (empError) throw empError;

  if (!employees || employees.length === 0) return [];

  const employeeIds = employees.map((employee) => employee.id);

  const { data: sheets, error: sheetError } = await supabase
    .from('goal_sheets')
    .select(`
      id,
      employee_id,
      users!goal_sheets_employee_id_fkey(id, name, email),
      goals(
        *,
        goal_achievements(*),
        checkin_comments(*)
      )
    `)
    .in('employee_id', employeeIds)
    .eq('cycle_id', cycleId);

  if (sheetError) throw sheetError;

  return (sheets || []).flatMap((sheet) =>
    (sheet.goals || []).map((goal) => ({
      ...goal,
      sheet_id: sheet.id,
      employee_id: sheet.employee_id,
      employee: sheet.users || null,
      achievements: goal.goal_achievements || [],
      comments: goal.checkin_comments || [],
    }))
  );
}
