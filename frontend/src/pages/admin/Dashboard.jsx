import React, { useEffect, useMemo, useState } from 'react'
import { getAdminBootstrap } from '../../lib/api'

function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-semibold mt-2 text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-2">{hint}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [bootstrap, setBootstrap] = useState({
    departments: [],
    teams: [],
    employees: [],
    managers: [],
    cycles: [],
    cycleRules: [],
    kpiTemplates: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshBootstrap = async () => {
    const data = await getAdminBootstrap()
    if (typeof data === 'string') {
      throw new Error('Unexpected server response')
    }
    setBootstrap({
      departments: data.departments || [],
      teams: data.teams || [],
      employees: data.employees || [],
      managers: data.managers || [],
      cycles: data.cycles || [],
      cycleRules: data.cycleRules || [],
      kpiTemplates: data.kpiTemplates || [],
    })
  }

  useEffect(() => {
    async function load() {
      try {
        await refreshBootstrap()
      } catch (err) {
        setError(err.message || 'Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const counts = useMemo(
    () => ({
      departments: bootstrap.departments.length,
      teams: bootstrap.teams.length,
      employees: bootstrap.employees.length,
      managers: bootstrap.managers.length,
      cycles: bootstrap.cycles.length,
      kpiTemplates: bootstrap.kpiTemplates.length,
    }),
    [bootstrap]
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Overview</h2>
        <p className="mt-1 text-sm text-gray-600">High-level statistics for the organization.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {loading ? <div className="text-sm text-gray-500">Loading admin data...</div> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Departments" value={counts.departments} hint="Org units configured" />
        <StatCard label="Teams" value={counts.teams} hint="Manager-led groups" />
        <StatCard label="Employees" value={counts.employees} hint="Mapped staff members" />
        <StatCard label="Managers" value={counts.managers} hint="Direct report owners" />
        <StatCard label="Cycles" value={counts.cycles} hint="Active and upcoming" />
        <StatCard label="KPI Templates" value={counts.kpiTemplates} hint="Shared KPI definitions" />
      </div>
    </div>
  )
}
