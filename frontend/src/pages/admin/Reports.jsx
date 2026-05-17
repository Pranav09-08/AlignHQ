import React, { useEffect, useState } from 'react'
import { getAdminReports } from '../../lib/api'

function ReportCard({ label, value, hint }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      <div className="mt-1 text-xs text-gray-400">{hint}</div>
    </div>
  )
}

export default function AdminReports() {
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminReports()
        if (typeof data !== 'string') {
          setCounts(data.counts || null)
        }
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [])

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
      <p className="mt-2 text-sm text-slate-600">Export achievement and completion reports here.</p>

      {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ReportCard label="Departments" value={counts?.departments ?? '—'} hint="Org structure count" />
        <ReportCard label="Teams" value={counts?.teams ?? '—'} hint="Active teams" />
        <ReportCard label="Goal Sheets" value={counts?.goalSheets ?? '—'} hint="Submitted cycles" />
        <ReportCard label="Shared KPIs" value={counts?.sharedGoals ?? '—'} hint="Synced KPI targets" />
      </div>

      <div className="mt-6 rounded-lg border bg-white p-4 shadow-sm text-sm text-gray-600">
        Add export/download controls here later for cycle-wise and department-wise performance reports.
      </div>
    </div>
  )
}
