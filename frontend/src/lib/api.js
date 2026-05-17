const API_BASE = 'https://alignhq.onrender.com/api';

export async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Attempt to parse JSON only when content-type is application/json
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    if (contentType.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'API call failed');
    }

    // Fallback: return text for non-JSON error bodies (e.g., HTML)
    const text = await response.text();
    throw new Error(text || `API call failed: ${response.status}`);
  }

  if (contentType.includes('application/json')) {
    return response.json();
  }

  // If server returned plain text, return it as text
  return response.text();
}

export async function getEmployeeGoals(userId) {
  const data = await apiCall(`/employee/my-goals?employeeId=${userId}`);
  if (typeof data === 'string') return data;
  return { ...data, goals: data.sheet?.goals || [], sharedGoals: data.sharedGoals || [] };
}

export async function reopenGoalSheet(sheetId) {
  return apiCall(`/employee/sheets/${sheetId}/reopen`, {
    method: 'POST',
  });
}

export async function getEmployeeCheckins(userId) {
  return apiCall(`/employee/checkins?employeeId=${userId}`);
}

export async function saveGoalCheckin(goalId, payload) {
  return apiCall(`/employee/checkins/${goalId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getManagerApprovals(managerId) {
  return apiCall(`/manager/approvals?managerId=${managerId}`);
}

export async function reviewGoalSheet(sheetId, payload) {
  return apiCall(`/manager/approvals/${sheetId}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adjustSharedGoalWeightage(sharedGoalId, weightage) {
  return apiCall(`/employee/shared-goals/${sharedGoalId}/weightage`, {
    method: 'PATCH',
    body: JSON.stringify({ weightage }),
  });
}

export async function createEmployeeGoal(payload) {
  return apiCall('/employee/goals/add', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateEmployeeGoal(goalId, payload) {
  return apiCall(`/employee/goals/${goalId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteEmployeeGoal(goalId) {
  return apiCall(`/employee/goals/${goalId}`, {
    method: 'DELETE',
  });
}

export async function submitGoalSheet(sheetId) {
  return apiCall(`/employee/sheets/${sheetId}/submit`, {
    method: 'POST',
  });
}

export async function getManagerTeamGoals(managerId) {
  return apiCall(`/manager/team-goals?manager_id=${managerId}`);
}

export async function getPendingApprovals(managerId) {
  return apiCall(`/manager/pending-approvals?manager_id=${managerId}`);
}

export async function getAdminCycles() {
  return apiCall('/admin/cycles');
}

export async function getAdminReports() {
  return apiCall('/admin/reports');
}

export async function getAdminBootstrap() {
  return apiCall('/admin/bootstrap');
}

export async function createDepartment(payload) {
  return apiCall('/admin/departments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDepartment(id, payload) {
  return apiCall(`/admin/departments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function createTeam(payload) {
  return apiCall('/admin/teams', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTeam(id, payload) {
  return apiCall(`/admin/teams/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function createUser(payload) {
  return apiCall('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id, payload) {
  return apiCall(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function assignEmployeeManager(employeeId, managerId) {
  return apiCall(`/admin/users/${employeeId}/manager`, {
    method: 'PATCH',
    body: JSON.stringify({ manager_id: managerId }),
  });
}

export async function createCycle(payload) {
  return apiCall('/admin/cycles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCycle(id, payload) {
  return apiCall(`/admin/cycles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function setCycleRules(payload) {
  return apiCall('/admin/cycle-rules', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createKpiTemplate(payload) {
  return apiCall('/admin/kpi-templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function shareTeamKpiTemplate(templateId, cycleId = null) {
  return apiCall(`/admin/kpi-templates/${templateId}/share`, {
    method: 'POST',
    body: JSON.stringify(cycleId ? { cycle_id: cycleId } : {}),
  });
}
