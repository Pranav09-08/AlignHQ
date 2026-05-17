import React, { useEffect, useState } from 'react'
import { getAdminReports, getAdminBootstrap } from '../../lib/api'

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
  const [counts, setCounts] = useState(null)
  const [bootstrap, setBootstrap] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [reportData, bootstrapData] = await Promise.all([
          getAdminReports(),
          getAdminBootstrap(),
        ])
        if (typeof reportData !== 'string') setCounts(reportData.counts || null)
        if (typeof bootstrapData !== 'string') setBootstrap(bootstrapData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="mt-1 text-sm text-gray-600">Organization-wide performance and goal tracking overview.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <div className="text-sm text-gray-500">Loading reports...</div>}

      {!loading && (
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
    </div>
  )
}
