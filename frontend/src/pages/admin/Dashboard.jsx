import React, { useEffect, useState } from 'react'
import { getAdminCycles, getAdminReports } from '../../lib/api'

export default function AdminDashboard() {
  const [cycles, setCycles] = useState([])
  const [reports, setReports] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const c = await getAdminCycles()
        if (typeof c !== 'string') setCycles(c.cycles || [])
      } catch (e) {}
      try {
        const r = await getAdminReports()
        if (typeof r !== 'string') setReports(r.reports || [])
      } catch (e) {}
    }
    fetchData()
  }, [])

  return (
    <div>
      <h2 className="text-lg font-semibold">Admin Home</h2>
      <p className="mt-2 text-sm text-slate-600">Manage cycles, view reports, and perform audit tasks.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Active Cycles</div>
          <div className="text-2xl font-semibold mt-1">{cycles.length}</div>
          <div className="text-xs text-gray-400 mt-2">Open goal cycles</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Reports</div>
          <div className="text-2xl font-semibold mt-1">{reports.length}</div>
          <div className="text-xs text-gray-400 mt-2">Generated analytics</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500">Users</div>
          <div className="text-2xl font-semibold mt-1">—</div>
          <div className="text-xs text-gray-400 mt-2">User management coming soon</div>
        </div>
      </div>
    </div>
  )
}
