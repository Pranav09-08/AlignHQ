import React, { useEffect, useState } from 'react'
import { useAuth } from '../../route'
import { getManagerApprovals } from '../../lib/api'

const statusColors = {
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
}

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [cycle, setCycle] = useState(null)
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      try {
        const data = await getManagerApprovals(user.id)
        if (typeof data !== 'string') {
          setCycle(data.cycle || null)
          setSheets(data.sheets || [])
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data')
        console.error('Manager dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  const pending = sheets.filter(s => s.status === 'submitted')
  const approved = sheets.filter(s => s.status === 'approved')
  const totalGoals = sheets.reduce((sum, s) => sum + (s.goals?.length || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manager Dashboard — here's your team's performance overview.
        </p>
      </div>

      {cycle && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex items-center gap-3">
          <div className="text-xs text-blue-500 font-medium uppercase tracking-wide">Active Cycle</div>
          <div className="font-semibold text-blue-900">{cycle.name}</div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">{cycle.phase}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-sm text-gray-500">Team Members</div>
          <div className="text-3xl font-bold mt-1 text-gray-900">{sheets.length}</div>
          <div className="text-xs text-gray-400 mt-1">with goal sheets</div>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4">
          <div className="text-sm text-amber-600">Pending Review</div>
          <div className="text-3xl font-bold mt-1 text-amber-700">{pending.length}</div>
          <div className="text-xs text-gray-400 mt-1">awaiting your action</div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-4">
          <div className="text-sm text-emerald-600">Approved</div>
          <div className="text-3xl font-bold mt-1 text-emerald-700">{approved.length}</div>
          <div className="text-xs text-gray-400 mt-1">goal sheets locked</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-sm text-gray-500">Total Goals</div>
          <div className="text-3xl font-bold mt-1 text-gray-900">{totalGoals}</div>
          <div className="text-xs text-gray-400 mt-1">across all sheets</div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-base font-semibold text-gray-900">Team Overview</h3>
          <p className="text-sm text-gray-500 mt-0.5">All members' goal sheet statuses for the current cycle.</p>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-sm text-gray-500">Loading team data...</div>
        ) : sheets.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            {cycle
              ? 'No goal sheets submitted yet for this cycle.'
              : 'No active cycle found. Ask your admin to create one.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sheets.map(sheet => {
              const employee = sheet.users || {}
              const goals = sheet.goals || []
              return (
                <div key={sheet.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">{employee.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {employee.email} · {goals.length} goal{goals.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sheet.submitted_at && (
                      <span className="text-xs text-gray-400">
                        {new Date(sheet.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColors[sheet.status] || 'bg-gray-100 text-gray-600'}`}>
                      {sheet.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have <span className="font-bold">{pending.length}</span> goal sheet{pending.length !== 1 ? 's' : ''} waiting for review. Go to <span className="font-semibold">Pending Approvals</span> to take action.
        </div>
      )}
    </div>
  )
}
