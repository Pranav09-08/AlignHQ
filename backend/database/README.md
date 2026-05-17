# Database migration

This folder contains the Supabase/Postgres schema for AlignHQ.

## Files
- `001_org_schema.sql` — creates the org model, cycles, KPI templates, goal sheets, shared goals, check-ins, and audit trail.

## How to apply
1. Open Supabase SQL editor.
2. Paste the contents of `001_org_schema.sql`.
3. Run it on your project database.

## Notes
- The schema uses `pgcrypto` for `gen_random_uuid()`.
- `users.manager_id` is the direct reporting line for employees.
- `teams.manager_id` allows a team-level manager assignment for shared KPIs and team oversight.
- `kpi_templates` supports organization/department/team/cycle-level KPI templates.
