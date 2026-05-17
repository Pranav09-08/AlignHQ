-- AlignHQ org + performance schema for Supabase/Postgres
-- Run this in Supabase SQL editor or your migration pipeline.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Updated-at trigger helper
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Enums as check constraints for portability
-- -----------------------------------------------------------------------------

-- Departments / teams
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  description text,
  manager_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_department_name_unique unique (department_id, name)
);

-- Users / hierarchy
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('Employee', 'Manager', 'Admin')),
  manager_id uuid references public.users(id) on delete set null,
  department_id uuid not null references public.departments(id) on delete restrict,
  team_id uuid references public.teams(id) on delete set null,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teams
  drop constraint if exists teams_manager_id_fk;

alter table public.teams
  add constraint teams_manager_id_fk
  foreign key (manager_id) references public.users(id) on delete set null;

create index if not exists idx_users_manager_id on public.users(manager_id);
create index if not exists idx_users_department_id on public.users(department_id);
create index if not exists idx_users_team_id on public.users(team_id);
create index if not exists idx_teams_department_id on public.teams(department_id);
create index if not exists idx_teams_manager_id on public.teams(manager_id);

-- Cycles / cycle rules
create table if not exists public.cycles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phase text not null check (phase in ('goal_setting', 'q1', 'q2', 'q3', 'q4', 'annual')),
  window_open timestamptz,
  window_close timestamptz,
  status text not null check (status in ('active', 'closed', 'upcoming')) default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cycles_name_phase_unique unique (name, phase)
);

create table if not exists public.cycle_rules (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null unique references public.cycles(id) on delete cascade,
  rule_name text not null,
  description text,
  min_goal_weightage numeric(5,2) not null default 10,
  max_goals_per_sheet integer not null default 8,
  allow_edit_after_submission boolean not null default false,
  shared_kpi_enabled boolean not null default true,
  checkin_window_start date,
  checkin_window_end date,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- KPI templates / shared performance setup
create table if not exists public.kpi_templates (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.users(id) on delete set null,
  scope text not null check (scope in ('organization', 'department', 'team', 'cycle')),
  department_id uuid references public.departments(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  cycle_id uuid references public.cycles(id) on delete cascade,
  title text not null,
  description text,
  thrust_area text,
  uom_type text not null check (uom_type in ('numeric_max', 'numeric_min', 'percentage_max', 'percentage_min', 'timeline', 'zero_based')),
  target numeric(12,2),
  unit text,
  default_weightage numeric(5,2) not null default 10,
  is_shared boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kpi_templates_scope_target_chk check (
    (scope = 'organization' and department_id is null and team_id is null and cycle_id is null) or
    (scope = 'department' and department_id is not null) or
    (scope = 'team' and team_id is not null) or
    (scope = 'cycle' and cycle_id is not null)
  )
);

create index if not exists idx_kpi_templates_department_id on public.kpi_templates(department_id);
create index if not exists idx_kpi_templates_team_id on public.kpi_templates(team_id);
create index if not exists idx_kpi_templates_cycle_id on public.kpi_templates(cycle_id);

-- Goal sheets / goals / achievements
create table if not exists public.goal_sheets (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.users(id) on delete cascade,
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  status text not null check (status in ('draft', 'submitted', 'approved', 'rejected')) default 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_id uuid references public.users(id) on delete set null,
  rejection_reason text,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goal_sheets_employee_cycle_unique unique (employee_id, cycle_id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  goal_sheet_id uuid not null references public.goal_sheets(id) on delete cascade,
  title text not null,
  description text,
  thrust_area text,
  uom_type text not null check (uom_type in ('numeric_max', 'numeric_min', 'percentage_max', 'percentage_min', 'timeline', 'zero_based')),
  target numeric(12,2),
  unit text,
  weightage numeric(5,2) not null check (weightage >= 10 and weightage <= 100),
  status text not null check (status in ('active', 'achieved', 'missed', 'in_progress')) default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_goals_goal_sheet_id on public.goals(goal_sheet_id);

create table if not exists public.goal_achievements (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  actual_achievement numeric(12,2),
  achievement_status text not null check (achievement_status in ('not_started', 'on_track', 'completed')) default 'not_started',
  progress_score numeric(5,2) not null default 0,
  updated_at timestamptz not null default now(),
  constraint goal_achievements_goal_cycle_unique unique (goal_id, cycle_id)
);

-- Shared KPIs that sync from a parent goal/template to employees
create table if not exists public.shared_goals (
  id uuid primary key default gen_random_uuid(),
  parent_goal_id uuid references public.goals(id) on delete cascade,
  kpi_template_id uuid references public.kpi_templates(id) on delete set null,
  assigned_to_user_id uuid not null references public.users(id) on delete cascade,
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  can_adjust_weightage boolean not null default true,
  weightage_adjusted numeric(5,2),
  status text not null check (status in ('active', 'synced')) default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_shared_goals_assigned_to_user_id on public.shared_goals(assigned_to_user_id);
create index if not exists idx_shared_goals_cycle_id on public.shared_goals(cycle_id);
create unique index if not exists idx_shared_goals_assignment_unique
  on public.shared_goals (
    assigned_to_user_id,
    cycle_id,
    coalesce(parent_goal_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- Quarterly manager check-ins
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  goal_sheet_id uuid not null references public.goal_sheets(id) on delete cascade,
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  manager_id uuid not null references public.users(id) on delete cascade,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_checkins_goal_sheet_id on public.checkins(goal_sheet_id);
create index if not exists idx_checkins_manager_id on public.checkins(manager_id);
create index if not exists idx_checkins_cycle_id on public.checkins(cycle_id);

create table if not exists public.checkin_comments (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  comment text not null,
  created_at timestamptz not null default now()
);

-- Audit trail for post-lock changes
create table if not exists public.audit_trail (
  id uuid primary key default gen_random_uuid(),
  goal_sheet_id uuid references public.goal_sheets(id) on delete cascade,
  changed_by uuid not null references public.users(id) on delete cascade,
  action text not null check (action in ('unlock', 'goal_edit', 'weightage_change', 'status_change')),
  entity_type text not null check (entity_type in ('goal', 'goal_sheet', 'achievement')),
  entity_id uuid not null,
  old_value jsonb,
  new_value jsonb,
  changed_at timestamptz not null default now()
);

create index if not exists idx_audit_trail_goal_sheet_id on public.audit_trail(goal_sheet_id);
create index if not exists idx_audit_trail_changed_by on public.audit_trail(changed_by);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------

drop trigger if exists trg_departments_updated_at on public.departments;
create trigger trg_departments_updated_at
before update on public.departments
for each row execute function public.set_updated_at();

drop trigger if exists trg_teams_updated_at on public.teams;
create trigger trg_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_cycles_updated_at on public.cycles;
create trigger trg_cycles_updated_at
before update on public.cycles
for each row execute function public.set_updated_at();

drop trigger if exists trg_cycle_rules_updated_at on public.cycle_rules;
create trigger trg_cycle_rules_updated_at
before update on public.cycle_rules
for each row execute function public.set_updated_at();

drop trigger if exists trg_kpi_templates_updated_at on public.kpi_templates;
create trigger trg_kpi_templates_updated_at
before update on public.kpi_templates
for each row execute function public.set_updated_at();

drop trigger if exists trg_goal_sheets_updated_at on public.goal_sheets;
create trigger trg_goal_sheets_updated_at
before update on public.goal_sheets
for each row execute function public.set_updated_at();

drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

drop trigger if exists trg_goal_achievements_updated_at on public.goal_achievements;
create trigger trg_goal_achievements_updated_at
before update on public.goal_achievements
for each row execute function public.set_updated_at();

drop trigger if exists trg_shared_goals_updated_at on public.shared_goals;
create trigger trg_shared_goals_updated_at
before update on public.shared_goals
for each row execute function public.set_updated_at();

drop trigger if exists trg_checkins_updated_at on public.checkins;
create trigger trg_checkins_updated_at
before update on public.checkins
for each row execute function public.set_updated_at();
