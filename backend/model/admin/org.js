import { supabase } from '../../config/db.js';

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }
}

function isMissingTableError(error) {
  return error?.code === 'PGRST205' || /could not find the table/i.test(error?.message || '');
}

async function safeSelect(queryPromise, fallbackData = []) {
  const { data, error, count } = await queryPromise;
  if (error) {
    if (isMissingTableError(error)) {
      return { data: fallbackData, error: null, count: count ?? fallbackData.length };
    }
    return { data, error, count };
  }
  return { data, error: null, count };
}

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

export async function getAdminCyclesList() {
  ensureSupabase();

  const { data, error } = await safeSelect(supabase.from('cycles').select('*').order('created_at', { ascending: false }));
  if (error) throw error;
  return data || [];
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

export async function createDepartment(payload) {
  ensureSupabase();
  return supabase.from('departments').insert(payload).select('*').single();
}

export async function createTeam(payload) {
  ensureSupabase();
  return supabase.from('teams').insert(payload).select('*, departments(id, name)').single();
}

export async function assignManagerToEmployee(employeeId, managerId) {
  ensureSupabase();
  return supabase.from('users').update({ manager_id: managerId || null }).eq('id', employeeId).select(
    'id, name, email, role, manager_id, department_id, team_id, departments(id, name), teams!users_team_id_fkey(id, name)'
  ).single();
}

export async function createCycle(payload) {
  ensureSupabase();
  return supabase.from('cycles').insert(payload).select('*').single();
}

export async function updateCycle(id, payload) {
  ensureSupabase();
  return supabase.from('cycles').update(payload).eq('id', id).select('*').single();
}

export async function upsertCycleRules(payload) {
  ensureSupabase();
  return supabase.from('cycle_rules').upsert(payload, { onConflict: 'cycle_id' }).select('*, cycles(id, name, phase, status)').single();
}

export async function createKpiTemplate(payload) {
  ensureSupabase();
  return supabase.from('kpi_templates').insert(payload).select('*, departments(id, name), teams(id, name), cycles(id, name, phase)').single();
}

export async function createUser(payload) {
  ensureSupabase();
  return supabase.from('users').insert(payload).select('id, name, email, role, manager_id, department_id, team_id').single();
}

export async function updateDepartment(id, payload) {
  ensureSupabase();
  return supabase.from('departments').update(payload).eq('id', id).select('*').single();
}

export async function updateTeam(id, payload) {
  ensureSupabase();
  return supabase.from('teams').update(payload).eq('id', id).select('*, departments(id, name)').single();
}

export async function updateUser(id, payload) {
  ensureSupabase();
  return supabase.from('users').update(payload).eq('id', id).select('id, name, email, role, manager_id, department_id, team_id').single();
}
