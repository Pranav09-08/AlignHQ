import { supabase } from '../../config/db.js';
import { ensureSupabase } from './helpers.js';

export async function getActiveCycle() {
  ensureSupabase();
  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getKpiTemplateById(templateId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('kpi_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) throw error;
  return data;
}

export async function getTeamMembers(teamId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role')
    .eq('team_id', teamId)
    .eq('role', 'Employee');

  if (error) throw error;
  return data || [];
}

export async function getGoalSheet(employeeId, cycleId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('goal_sheets')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('cycle_id', cycleId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createGoalSheet(payload) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('goal_sheets')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function createGoal(payload) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('goals')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function getExistingSharedGoal(assignedToUserId, templateId, cycleId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('shared_goals')
    .select('id, parent_goal_id')
    .eq('assigned_to_user_id', assignedToUserId)
    .eq('kpi_template_id', templateId)
    .eq('cycle_id', cycleId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createSharedGoal(payload) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('shared_goals')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
