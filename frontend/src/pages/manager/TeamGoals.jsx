import React, { useEffect, useState } from 'react'
import { useAuth } from '../../route'
import { getManagerTeamGoals } from '../../lib/api'

const statusColors = {
  active: 'bg-blue-50 text-blue-700',
  achieved: 'bg-emerald-50 text-emerald-700',
  missed: 'bg-red-50 text-red-700',
  in_progress: 'bg-amber-50 text-amber-700',
}

export default function ManagerTeamGoals() {
  const { user } = useAuth()
  const [cycle, setCycle] = useState(null)
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterEmployee, setFilterEmployee] = useState('')

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      try {
        const data = await getManagerTeamGoals(user.id)
        if (typeof data !== 'string') {
          setCycle(data.cycle || null)
          setGoals(data.goals || [])
        }
      } catch (err) {
        setError(err.message || 'Failed to load team goals')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  // Unique employees for filter dropdown
  const employees = [...new Map(goals.map(g => [g.employee_id, g.employee])).values()].filter(Boolean)

  const filtered = goals.filter(g => {
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase())
    const matchEmployee = !filterEmployee || g.employee_id === filterEmployee
    return matchSearch && matchEmployee
  })

  const totalWeightage = filtered.reduce((sum, g) => sum + Number(g.weightage || 0), 0)
  const byStatus = filtered.reduce((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Team Goals</h2>
        <p className="mt-1 text-sm text-gray-600">View all goals set by your direct reports for the active cycle.</p>
      </div>

      {cycle && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex items-center gap-3">
          <div className="text-xs text-blue-500 font-medium uppercase tracking-wide">Cycle</div>
          <div className="font-semibold text-blue-900">{cycle.name}</div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">{cycle.phase}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-sm text-gray-500">Total Goals</div>
          <div className="text-3xl font-bold mt-1">{filtered.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-4">
          <div className="text-sm text-blue-600">Active</div>
          <div className="text-3xl font-bold mt-1 text-blue-700">{byStatus.active || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-4">
          <div className="text-sm text-emerald-600">Achieved</div>
          <div className="text-3xl font-bold mt-1 text-emerald-700">{byStatus.achieved || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4">
          <div className="text-sm text-amber-600">In Progress</div>
          <div className="text-3xl font-bold mt-1 text-amber-700">{byStatus.in_progress || 0}</div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-56"
          placeholder="Search goals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={filterEmployee}
          onChange={e => setFilterEmployee(e.target.value)}
        >
          <option value="">All members</option>
          {employees.map(emp => (
            <option key={emp?.id} value={emp?.id}>{emp?.name}</option>
          ))}
        </select>
      </div>

      {/* Goals table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Goals List</h3>
          <span className="text-xs text-gray-400">{filtered.length} goal{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-sm text-gray-500">Loading goals...</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            {cycle ? 'No goals found for the current filters.' : 'No active cycle. Ask your admin to activate one.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(goal => (
              <div key={goal.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{goal.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{goal.employee?.name || 'Unknown'} · {goal.employee?.email}</div>
                    {goal.description && (
                      <div className="text-xs text-gray-400 mt-1 truncate">{goal.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{goal.weightage}%</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {goal.target != null ? `Target: ${goal.target} ${goal.unit || ''}` : '—'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColors[goal.status] || 'bg-gray-100 text-gray-600'}`}>
                      {goal.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {goal.thrust_area && (
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{goal.thrust_area}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
