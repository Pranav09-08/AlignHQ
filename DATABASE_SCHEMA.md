# AlignHQ Database Schema

## Tables Overview

### 1. departments
Stores organizational departments.

```
id: uuid (primary key)
name: string (unique)
description: text (nullable)
created_at: timestamp
```

---

### 1.1 teams
Groups employees under a manager inside a department.

```
id: uuid (primary key)
department_id: uuid (foreign key to departments)
name: string
description: text (nullable)
manager_id: uuid (foreign key to users, nullable)
created_at: timestamp
updated_at: timestamp
```

---

### 2. users
Stores employee, manager, and admin users with role and hierarchy.

```
id: uuid (primary key)
name: string
email: string (unique)
role: enum ('Employee', 'Manager', 'Admin')
manager_id: uuid (foreign key to users, nullable - only for employees)
department_id: uuid (foreign key to departments)
created_at: timestamp
updated_at: timestamp
```

---

### 3. cycles
Goal cycles: Phase 1 (Goal Setting), Q1, Q2, Q3, Q4 (Check-ins), Annual.

```
id: uuid (primary key)
name: string ('Phase 1', 'Q1', 'Q2', 'Q3', 'Q4')
phase: enum ('goal_setting', 'q1', 'q2', 'q3', 'annual')
window_open: timestamp
window_close: timestamp
status: enum ('active', 'closed')
created_at: timestamp
updated_at: timestamp
```

---

### 3.1 cycle_rules
Per-cycle rules for goal and check-in behavior.

```
id: uuid (primary key)
cycle_id: uuid (foreign key to cycles, unique)
rule_name: string
description: text (nullable)
min_goal_weightage: number
max_goals_per_sheet: number
allow_edit_after_submission: boolean
shared_kpi_enabled: boolean
checkin_window_start: date (nullable)
checkin_window_end: date (nullable)
created_by: uuid (foreign key to users, nullable)
created_at: timestamp
updated_at: timestamp
```

---

### 3.2 kpi_templates
Reusable KPI definitions for organization, department, team, or cycle scopes.

```
id: uuid (primary key)
created_by: uuid (foreign key to users, nullable)
scope: enum ('organization', 'department', 'team', 'cycle')
department_id: uuid (foreign key to departments, nullable)
team_id: uuid (foreign key to teams, nullable)
cycle_id: uuid (foreign key to cycles, nullable)
title: string
description: text (nullable)
thrust_area: string (nullable)
uom_type: enum ('numeric_max', 'numeric_min', 'percentage_max', 'percentage_min', 'timeline', 'zero_based')
target: float (nullable)
unit: string (nullable)
default_weightage: float
is_shared: boolean
is_active: boolean
created_at: timestamp
updated_at: timestamp
```

---

### 4. goal_sheets
Submitted by employees, approved by managers, locked after approval.

```
id: uuid (primary key)
employee_id: uuid (foreign key to users)
cycle_id: uuid (foreign key to cycles)
status: enum ('draft', 'submitted', 'approved', 'rejected')
submitted_at: timestamp (nullable)
reviewed_at: timestamp (nullable)
reviewer_id: uuid (foreign key to users, manager, nullable)
rejection_reason: text (nullable)
locked_at: timestamp (nullable)
created_at: timestamp
updated_at: timestamp
```

---

### 5. goals
Individual goals within a goal sheet. Validates weightage and counts.

```
id: uuid (primary key)
goal_sheet_id: uuid (foreign key to goal_sheets)
title: string
description: text
thrust_area: string (e.g., 'Sales', 'Operations', 'Innovation')
uom_type: enum ('numeric_max', 'numeric_min', 'percentage_max', 'percentage_min', 'timeline', 'zero_based')
target: float (numeric target or count)
unit: string (optional, e.g., 'units', 'days', '%')
weightage: float (10-100, total per sheet = 100)
status: enum ('active', 'achieved', 'missed', 'in_progress')
created_at: timestamp
updated_at: timestamp
```

---

### 6. goal_achievements
Quarterly achievement updates by employees.

```
id: uuid (primary key)
goal_id: uuid (foreign key to goals)
cycle_id: uuid (foreign key to cycles)
actual_achievement: float
achievement_status: enum ('not_started', 'on_track', 'completed')
progress_score: float (calculated: 0-100)
updated_at: timestamp
```

---

### 7. shared_goals
KPIs pushed to multiple employees by admin/manager.

```
id: uuid (primary key)
parent_goal_id: uuid (foreign key to goals)
assigned_to_user_id: uuid (foreign key to users)
cycle_id: uuid (foreign key to cycles)
can_adjust_weightage: boolean (true)
weightage_adjusted: float (nullable)
status: enum ('active', 'synced')
created_at: timestamp
updated_at: timestamp
```

---

### 8. checkins
Manager check-in records for quarterly progress.

```
id: uuid (primary key)
goal_sheet_id: uuid (foreign key to goal_sheets)
cycle_id: uuid (foreign key to cycles)
manager_id: uuid (foreign key to users)
completed_at: timestamp
created_at: timestamp
updated_at: timestamp
```

---

### 9. checkin_comments
Structured feedback during manager check-ins.

```
id: uuid (primary key)
checkin_id: uuid (foreign key to checkins)
goal_id: uuid (foreign key to goals)
comment: text
created_at: timestamp
```

---

### 10. audit_trail
Logs all changes made after goal lock.

```
id: uuid (primary key)
goal_sheet_id: uuid (foreign key to goal_sheets)
changed_by: uuid (foreign key to users)
action: enum ('unlock', 'goal_edit', 'weightage_change', 'status_change')
entity_type: string ('goal', 'goal_sheet', 'achievement')
entity_id: uuid
old_value: text (JSON)
new_value: text (JSON)
changed_at: timestamp
```

---

## Key Business Rules

1. **Max 8 goals per goal sheet**
2. **Min 10% weightage per goal**
3. **Total weightage across all goals = 100%**
4. **Goal sheets locked after manager approval** (Admin can unlock)
5. **Only active cycle can accept submissions**
6. **Check-in windows: July (Q1), October (Q2), January (Q3), March/April (Q4)**
7. **Shared goals sync achievement from primary owner**
8. **All post-lock changes logged to audit trail**

---

## Relationships Diagram

```
departments (1) ──→ (many) users

users (1) ──→ (many) goal_sheets
         ↓
         └──→ (many) goals
              ↓
              └──→ (many) goal_achievements
              └──→ (many) shared_goals

users (manager) ──→ (many) checkins
              ↓
              └──→ (many) checkin_comments

cycles ──→ (many) goal_sheets
      ├──→ (many) goal_achievements
      └──→ (many) checkins

goal_sheets ──→ (many) audit_trail
