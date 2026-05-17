import { supabase } from '../../config/db.js';
import { ensureSupabase, safeSelect } from './helpers.js';

export async function getAdminBootstrapData() {
  ensureSupabase();

  const [departments, teams, employees, managers, cycles, cycleRules, kpiTemplates] = await Promise.all([
    safeSelect(supabase.from('departments').select('*').order('name', { ascending: true })),
    safeSelect(supabase.from('teams').select('*, departments:department_id (id, name)').order('name', { ascending: true })),
    safeSelect(
      supabase
      .from('users')
      .select('id, name, email, role, manager_id, department_id, team_id, departments(id, name), teams!users_team_id_fkey(id, name)')
      .eq('role', 'Employee')
      .order('name', { ascending: true })
    ),
    safeSelect(
      supabase
      .from('users')
      .select('id, name, email, role, manager_id, department_id, team_id, departments(id, name), teams!users_team_id_fkey(id, name)')
      .eq('role', 'Manager')
      .order('name', { ascending: true })
    ),
    safeSelect(supabase.from('cycles').select('*').order('created_at', { ascending: false })),
    safeSelect(supabase.from('cycle_rules').select('*, cycles:cycle_id (id, name, phase, status)').order('created_at', { ascending: false })),
    safeSelect(
      supabase
      .from('kpi_templates')
      .select('*, departments(id, name), teams(id, name), cycles(id, name, phase)')
      .order('created_at', { ascending: false })
    ),
  ]);

  const errors = [departments, teams, employees, managers, cycles, cycleRules, kpiTemplates].filter((result) => result.error);
  if (errors.length > 0) {
    throw errors[0].error;
  }

  return {
    departments: departments.data || [],
    teams: teams.data || [],
    employees: employees.data || [],
    managers: managers.data || [],
    cycles: cycles.data || [],
    cycleRules: cycleRules.data || [],
    kpiTemplates: kpiTemplates.data || [],
  };
}

export async function getAdminReportsData() {
  ensureSupabase();

  const [departments, teams, employees, managers, goalSheets, goals, checkins, sharedGoals] = await Promise.all([
    safeSelect(supabase.from('departments').select('id', { count: 'exact', head: true }), []),
    safeSelect(supabase.from('teams').select('id', { count: 'exact', head: true }), []),
    safeSelect(supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'Employee'), []),
    safeSelect(supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'Manager'), []),
    safeSelect(supabase.from('goal_sheets').select('id', { count: 'exact', head: true }), []),
    safeSelect(supabase.from('goals').select('id', { count: 'exact', head: true }), []),
    safeSelect(supabase.from('checkins').select('id', { count: 'exact', head: true }), []),
    safeSelect(supabase.from('shared_goals').select('id', { count: 'exact', head: true }), []),
  ]);

  const errors = [departments, teams, employees, managers, goalSheets, goals, checkins, sharedGoals].filter((result) => result.error);
  if (errors.length > 0) {
    throw errors[0].error;
  }

  return {
    counts: {
      departments: departments.count || 0,
      teams: teams.count || 0,
      employees: employees.count || 0,
      managers: managers.count || 0,
      goalSheets: goalSheets.count || 0,
      goals: goals.count || 0,
      checkins: checkins.count || 0,
      sharedGoals: sharedGoals.count || 0,
    },
  };
}
