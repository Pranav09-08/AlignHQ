import { getAdminBootstrapData, getAdminReportsData } from '../../model/admin/organization.js';
import { supabase } from '../../config/db.js';
import { ensureSupabase } from '../../model/admin/helpers.js';
import { reportsCache } from '../../config/cache.js';

export async function getBootstrap(req, res) {
  try {
    const cacheKey = 'admin_bootstrap';
    const cached = reportsCache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, ...cached, cached: true });
    }

    const data = await getAdminBootstrapData();
    reportsCache.set(cacheKey, data, 15); // Cache bootstrap for 15 seconds
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Admin bootstrap error:', error);
    res.status(500).json({ error: 'Failed to load admin data' });
  }
}

export async function listReports(_req, res) {
  try {
    const cacheKey = 'admin_reports';
    const cached = reportsCache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, ...cached, cached: true });
    }

    const reports = await getAdminReportsData();
    reportsCache.set(cacheKey, reports, 15); // Cache reports for 15 seconds
    res.json({ success: true, ...reports });
  } catch (error) {
    console.error('List reports error:', error);
    res.status(500).json({ error: error.message || 'Failed to load reports' });
  }
}

export async function exportAchievementReport(req, res) {
  try {
    ensureSupabase();

    // 1. Fetch all goals with their sheet (which has the employee info) and achievement
    const { data: goals, error: fetchErr } = await supabase
      .from('goals')
      .select(`
        id,
        title,
        weightage,
        target,
        unit,
        uom_type,
        status,
        goal_sheets (
          id,
          employee_id,
          users!goal_sheets_employee_id_fkey (name, email),
          cycles (name)
        ),
        goal_achievements (
          actual_achievement,
          achievement_status,
          progress_score
        )
      `);

    if (fetchErr) throw fetchErr;

    // 2. Build CSV rows
    const headers = [
      'Employee Name',
      'Employee Email',
      'Cycle',
      'Goal Title',
      'UOM Type',
      'Weightage (%)',
      'Planned Target',
      'Actual Achievement',
      'Achievement Status',
      'Progress Score (%)',
      'Goal Status'
    ];

    const csvRows = [headers.join(',')];

    for (const g of (goals || [])) {
      const sheet = g.goal_sheets || {};
      const emp = sheet.users || {};
      const cycle = sheet.cycles || {};
      const ach = g.goal_achievements?.[0] || {};

      // Sanitize fields (remove commas, double quotes)
      const sanitize = (val) => {
        if (val == null) return '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
      };

      const row = [
        sanitize(emp.name),
        sanitize(emp.email),
        sanitize(cycle.name),
        sanitize(g.title),
        sanitize(g.uom_type),
        sanitize(g.weightage),
        sanitize(`${g.target ?? ''} ${g.unit || ''}`.trim()),
        sanitize(`${ach.actual_achievement ?? ''} ${g.unit || ''}`.trim()),
        sanitize(ach.achievement_status || 'Not Started'),
        sanitize(ach.progress_score ?? 0),
        sanitize(g.status)
      ];

      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    // 3. Send CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=achievement_report.csv');
    res.status(200).send(csvContent);

  } catch (error) {
    console.error('export report error:', error);
    res.status(500).json({ error: error.message || 'Failed to export achievement report' });
  }
}

export async function getEscalations(req, res) {
  try {
    ensureSupabase();

    // 1. Fetch active cycles
    const { data: cycles, error: cycleErr } = await supabase
      .from('cycles')
      .select('*')
      .eq('status', 'active');

    if (cycleErr) throw cycleErr;
    if (!cycles || cycles.length === 0) {
      return res.json({ success: true, cycle: null, escalations: [] });
    }
    const cycle = cycles[0];

    // 2. Fetch all employees, managers and goal sheets for the active cycle
    const [usersRes, sheetsRes] = await Promise.all([
      supabase.from('users').select('id, name, email, manager_id, role, managers:manager_id (id, name, email)'),
      supabase.from('goal_sheets').select('*').eq('cycle_id', cycle.id)
    ]);

    if (usersRes.error) throw usersRes.error;
    if (sheetsRes.error) throw sheetsRes.error;

    const allUsers = usersRes.data || [];
    const employees = allUsers.filter(u => u.role === 'Employee');
    const sheets = sheetsRes.data || [];

    const escalations = [];

    // Thresholds:
    // N = 3 days for goal sheet submission since cycle open
    // M = 2 days for manager review since sheet submission
    const SUBMISSION_THRESHOLD_DAYS = 3;
    const APPROVAL_THRESHOLD_DAYS = 2;

    const now = new Date();

    for (const emp of employees) {
      const sheet = sheets.find(s => s.employee_id === emp.id);
      const manager = emp.managers || { name: 'N/A', email: 'N/A' };

      // Case 1: Employee hasn't created a sheet OR sheet is draft
      if (!sheet || sheet.status === 'draft') {
        const referenceTime = sheet ? new Date(sheet.created_at) : new Date(cycle.created_at);
        const diffMs = now - referenceTime;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays > SUBMISSION_THRESHOLD_DAYS) {
          escalations.push({
            id: `sub-${emp.id}`,
            rule_type: 'employee_submission',
            rule_name: 'Employee Goal Submission Delay',
            employee_name: emp.name,
            employee_email: emp.email,
            manager_name: manager.name,
            manager_email: manager.email,
            days_delayed: Math.floor(diffDays),
            escalation_level: diffDays > 5 ? 3 : (diffDays > 4 ? 2 : 1),
            escalation_chain: diffDays > 5 ? 'HR Escalation' : (diffDays > 4 ? 'Manager Skip-level Notify' : 'Direct Manager'),
            status: 'active',
            triggered_at: new Date(referenceTime.getTime() + SUBMISSION_THRESHOLD_DAYS * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      // Case 2: Sheet submitted but not reviewed
      if (sheet && sheet.status === 'submitted') {
        const submittedTime = sheet.submitted_at ? new Date(sheet.submitted_at) : new Date(sheet.updated_at);
        const diffMs = now - submittedTime;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays > APPROVAL_THRESHOLD_DAYS) {
          escalations.push({
            id: `appr-${sheet.id}`,
            rule_type: 'manager_approval',
            rule_name: 'Manager Review Approval Delay',
            employee_name: emp.name,
            employee_email: emp.email,
            manager_name: manager.name,
            manager_email: manager.email,
            days_delayed: Math.floor(diffDays),
            escalation_level: diffDays > 4 ? 3 : (diffDays > 3 ? 2 : 1),
            escalation_chain: diffDays > 4 ? 'HR Escalation' : (diffDays > 3 ? 'Skip-level / HR' : 'Manager Notify'),
            status: 'active',
            triggered_at: new Date(submittedTime.getTime() + APPROVAL_THRESHOLD_DAYS * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }
    }

    res.json({
      success: true,
      cycle,
      escalations
    });

  } catch (error) {
    console.error('getEscalations error:', error);
    res.status(500).json({ error: error.message || 'Failed to load escalations' });
  }
}
