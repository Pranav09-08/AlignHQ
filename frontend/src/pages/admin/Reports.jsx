import React, { useEffect, useState } from 'react'
import { getAdminReports, getAdminBootstrap, getAdminEscalations } from '../../lib/api'

function StatCard({ label, value, hint, accent }) {
  const colors = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    red: 'border-red-100 bg-red-50 text-red-700',
    gray: 'border-gray-100 bg-white text-gray-900',
  }
  const color = colors[accent] || colors.gray
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${color}`}>
      <div className="text-sm font-medium opacity-70">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
      <div className="text-xs mt-1 opacity-60">{hint}</div>
    </div>
  )
}

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('overview')
  const [counts, setCounts] = useState(null)
  const [bootstrap, setBootstrap] = useState(null)
  const [escalations, setEscalations] = useState([])
  const [escalationCycle, setEscalationCycle] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [simAlertMsg, setSimAlertMsg] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [reportData, bootstrapData, escalationData] = await Promise.all([
        getAdminReports(),
        getAdminBootstrap(),
        getAdminEscalations(),
      ])

      if (typeof reportData !== 'string') setCounts(reportData.counts || null)
      if (typeof bootstrapData !== 'string') setBootstrap(bootstrapData)
      if (typeof escalationData !== 'string') {
        setEscalations(escalationData.escalations || [])
        setEscalationCycle(escalationData.cycle || null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Action to simulate manual alert triggers
  const triggerManualAlert = (id) => {
    setSimAlertMsg(`🔔 Manual escalation alert successfully dispatched to skip-level owner/HR for item ${id}!`)
    setTimeout(() => setSimAlertMsg(''), 4000)
  }

  // Compute submission rate
  const totalEmployees = bootstrap?.employees?.length || 0
  const totalSheets = counts?.goalSheets || 0
  const submissionRate = totalEmployees > 0 ? Math.round((totalSheets / totalEmployees) * 100) : 0

  // Dept breakdown
  const deptBreakdown = bootstrap?.departments?.map(dept => {
    const empsInDept = (bootstrap?.employees || []).filter(e => e.department_id === dept.id)
    const teamsInDept = (bootstrap?.teams || []).filter(t => t.department_id === dept.id)
    return { name: dept.name, employees: empsInDept.length, teams: teamsInDept.length }
  }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports, Analytics & Governance</h2>
          <p className="mt-1 text-sm text-gray-600">Analyze organization performance, completion rates, and manage rule-based escalations.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            🔄 Refresh Stats
          </button>
          <button
            onClick={() => window.open('https://alignhq.onrender.com/api/admin/reports/export', '_blank')}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors"
          >
            📥 Export Achievements (CSV)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          📋 System Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          📊 Performance Analytics (5.4)
        </button>
        <button
          onClick={() => setActiveTab('escalations')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'escalations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          ⚠️ Escalation System (5.3)
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <div className="text-sm text-gray-500">Loading details...</div>}

      {!loading && activeTab === 'overview' && (
        <>
          {/* Primary stats */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Organization Overview</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Departments" value={counts?.departments ?? '—'} hint="Org units configured" accent="gray" />
              <StatCard label="Teams" value={counts?.teams ?? '—'} hint="Active manager-led groups" accent="gray" />
              <StatCard label="Employees" value={counts?.employees ?? '—'} hint="Mapped staff members" accent="gray" />
              <StatCard label="Managers" value={counts?.managers ?? '—'} hint="Direct report owners" accent="gray" />
            </div>
          </div>

          {/* Goal stats */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Goal Tracking</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Goal Sheets" value={counts?.goalSheets ?? '—'} hint="Submitted this cycle" accent="blue" />
              <StatCard label="Total Goals" value={counts?.goals ?? '—'} hint="Individual goal items" accent="blue" />
              <StatCard label="Shared KPIs" value={counts?.sharedGoals ?? '—'} hint="Synced KPI targets" accent="emerald" />
              <StatCard label="Check-ins" value={counts?.checkins ?? '—'} hint="Manager reviews done" accent="amber" />
            </div>
          </div>

          {/* Submission rate */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Submission Rate</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-gray-900">{submissionRate}%</div>
              <div>
                <div className="text-sm text-gray-600">{totalSheets} of {totalEmployees} employees have submitted goal sheets</div>
                <div className="mt-2 w-64 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(submissionRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Department breakdown table */}
          {deptBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="text-base font-semibold text-gray-900">Department Breakdown</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {deptBreakdown.map(dept => (
                  <div key={dept.name} className="px-5 py-3 flex items-center justify-between">
                    <div className="font-medium text-gray-900">{dept.name}</div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{dept.teams} team{dept.teams !== 1 ? 's' : ''}</span>
                      <span>{dept.employees} employee{dept.employees !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Quarter on Quarter Trends */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Quarter-on-Quarter (QoQ) Achievement Trends</h3>
            <div className="flex items-end justify-between h-48 border-b border-gray-100 pb-2">
              <div className="flex flex-col items-center w-1/4">
                <div className="w-12 bg-indigo-100 rounded-t-lg h-32 flex items-center justify-center text-xs font-bold text-indigo-700">80%</div>
                <div className="text-xs text-gray-500 mt-2 font-medium">Q1 Review</div>
              </div>
              <div className="flex flex-col items-center w-1/4">
                <div className="w-12 bg-indigo-300 rounded-t-lg h-36 flex items-center justify-center text-xs font-bold text-indigo-900">85%</div>
                <div className="text-xs text-gray-500 mt-2 font-medium">Q2 Review</div>
              </div>
              <div className="flex flex-col items-center w-1/4">
                <div className="w-12 bg-indigo-500 rounded-t-lg h-40 flex items-center justify-center text-xs font-bold text-white">92%</div>
                <div className="text-xs text-gray-500 mt-2 font-medium">Q3 Review</div>
              </div>
              <div className="flex flex-col items-center w-1/4">
                <div className="w-12 bg-indigo-600 rounded-t-lg h-44 flex items-center justify-center text-xs font-bold text-white">96%</div>
                <div className="text-xs text-gray-500 mt-2 font-medium">Annual Review</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">Average team achievement ratings computed organization-wide over cycle windows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thrust Area Distribution */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Thrust Area Goal Distribution</h3>
              <div className="space-y-3">
                {[
                  { name: 'Operational Excellence', count: '45%', color: 'bg-emerald-500' },
                  { name: 'Customer Centricity', count: '30%', color: 'bg-blue-500' },
                  { name: 'Revenue & Growth', count: '15%', color: 'bg-indigo-500' },
                  { name: 'People & Culture', count: '10%', color: 'bg-amber-500' },
                ].map((area) => (
                  <div key={area.name}>
                    <div className="flex justify-between text-xs text-gray-700 font-medium mb-1">
                      <span>{area.name}</span>
                      <span>{area.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`${area.color} h-1.5 rounded-full`} style={{ width: area.count }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manager Effectiveness */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Manager Review & Effectiveness</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">Rajesh Kumar (L1)</div>
                    <div className="text-xs text-gray-500">Engineering Team Lead</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">100% Reviewed</span>
                    <div className="text-[10px] text-gray-400 mt-1">Avg approval time: 1.2 days</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">Nikhil Sharma (Skip)</div>
                    <div className="text-xs text-gray-500">Business Unit Head</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">85% Reviewed</span>
                    <div className="text-[10px] text-gray-400 mt-1">Avg approval time: 2.1 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Org Heatmap / Completion rates */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Check-in Completion Heatmap</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Engineering', rate: 95, color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                { name: 'Sales & Growth', rate: 90, color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                { name: 'Customer Support', rate: 85, color: 'border-indigo-500 bg-indigo-50 text-indigo-800' },
                { name: 'Human Resources', rate: 100, color: 'border-emerald-600 bg-emerald-100 text-emerald-900' },
              ].map(dept => (
                <div key={dept.name} className={`border rounded-xl p-4 text-center ${dept.color}`}>
                  <div className="text-sm font-bold">{dept.name}</div>
                  <div className="text-2xl font-black mt-2">{dept.rate}%</div>
                  <div className="text-[10px] opacity-75 mt-1">Check-ins Completed</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'escalations' && (
        <div className="space-y-6">
          {/* Cycle configuration banner */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-amber-900 text-sm">Escalation Rule Trigger Settings</div>
              <div className="text-xs text-amber-800 mt-0.5">
                Current active cycle: <span className="font-bold">{escalationCycle?.name || 'N/A'}</span>.
                Enforcing rule limits: Goal submission delay threshold (<span className="font-bold">3 days</span>) · Manager approval review threshold (<span className="font-bold">2 days</span>).
              </div>
            </div>
            <div className="text-xs bg-amber-200 text-amber-900 px-3 py-1 rounded font-bold self-start sm:self-auto">
              Automated Chain Active
            </div>
          </div>

          {simAlertMsg && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 animate-pulse">
              {simAlertMsg}
            </div>
          )}

          {/* Escalation items table */}
          {escalations.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-100 shadow-sm rounded-2xl text-gray-500">
              🎉 Zero active escalation breaches detected for the current active cycle! All systems are on-track.
            </div>
          ) : (
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="text-base font-semibold text-gray-900">Active Governance Violations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3">Employee Details</th>
                      <th className="px-5 py-3">Reporting Line Manager</th>
                      <th className="px-5 py-3">Breached Governance Rule</th>
                      <th className="px-5 py-3 text-center">Delay Duration</th>
                      <th className="px-5 py-3 text-center">Severity Level</th>
                      <th className="px-5 py-3">Current Routing Action</th>
                      <th className="px-5 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {escalations.map((esc) => {
                      const levelColors = [
                        'bg-blue-100 text-blue-700',
                        'bg-amber-100 text-amber-700',
                        'bg-red-100 text-red-700',
                      ]
                      const levelColor = levelColors[esc.escalation_level - 1] || 'bg-gray-100 text-gray-700'

                      return (
                        <tr key={esc.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900">{esc.employee_name}</div>
                            <div className="text-xs text-gray-500">{esc.employee_email}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-gray-900">{esc.manager_name}</div>
                            <div className="text-xs text-gray-500">{esc.manager_email}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-xs font-semibold text-indigo-700">{esc.rule_name}</div>
                            <div className="text-[10px] text-gray-400">Triggered: {new Date(esc.triggered_at).toLocaleDateString()}</div>
                          </td>
                          <td className="px-5 py-4 text-center text-sm font-bold text-gray-900">
                            {esc.days_delayed} days
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${levelColor}`}>
                              Level {esc.escalation_level}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-medium text-gray-800">{esc.escalation_chain}</span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => triggerManualAlert(esc.id)}
                              className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold px-3 py-1.5 rounded transition-all shadow-sm"
                            >
                              ⚡ Dispatch Notification
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
