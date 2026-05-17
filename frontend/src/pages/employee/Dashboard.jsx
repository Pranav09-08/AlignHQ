import React, { useState, useEffect } from 'react'
import { useAuth } from '../../route'
import { getEmployeeGoals, getEmployeeCheckins } from '../../lib/api'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchGoals() {
      try {
        if (!user?.id) return
        const data = await getEmployeeGoals(user.id)
        // API may return either JSON or text; normalize expected structure
        if (typeof data === 'string') {
          // backend returned plain text (or HTML) — surface friendly error
          throw new Error('Server returned unexpected response. Is the backend running?')
        }
        setGoals(data.goals || [])
      } catch (err) {
        setError(err.message)
        console.error('Error fetching goals:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [user?.id])

  useEffect(() => {
    async function fetchCheckins() {
      try {
        if (!user?.id) return
        const data = await getEmployeeCheckins(user.id)
        if (typeof data === 'string') return
        // assume data.checkins
        setCheckins(data.checkins || [])
      } catch (e) {
        // ignore silently for now
      }
    }
    fetchCheckins()
  }, [user?.id])


  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
        <p className="mt-1 text-sm text-slate-600">Department: {user?.departments?.name || 'N/A'}</p>
      </div>

      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Active Goals</div>
            <div className="text-2xl font-semibold mt-1">{goals.length}</div>
            <div className="text-xs text-gray-400 mt-2">Goals for current cycle</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Avg Progress</div>
            <div className="text-2xl font-semibold mt-1">
              {goals.length > 0
                ? `${Math.round((goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length) * 100)}%`
                : '0%'}
            </div>
            <div className="text-xs text-gray-400 mt-2">Estimated across active goals</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Upcoming Check-ins</div>
            <div className="text-2xl font-semibold mt-1">{checkins.length}</div>
            <div className="text-xs text-gray-400 mt-2">Next quarterly check-ins</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900">Active Goals</h3>
          <p className="text-sm text-blue-700 mt-1">You have {goals.length} active goals for this cycle</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 space-y-2">
            <div>{error}</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLoading(true)
                  setError('')
                  // retry
                  (async () => {
                    try {
                      const data = await getEmployeeGoals(user.id)
                      if (typeof data === 'string') throw new Error('Server returned unexpected response')
                      setGoals(data.goals || [])
                    } catch (e) {
                      setError(e.message)
                    } finally {
                      setLoading(false)
                    }
                  })()
                }}
                className="px-3 py-1 rounded bg-white text-sm text-red-700 border"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  // show demo goals fallback
                  setGoals([
                    { id: 'd1', title: 'Improve onboarding docs', description: 'Update and simplify onboarding docs', target: '50', unit: 'pages', weightage: 20 },
                    { id: 'd2', title: 'Customer responses', description: 'Respond to customer tickets within SLA', target: '95', unit: '%', weightage: 30 },
                  ])
                  setError('Showing demo goals (backend unavailable)')
                }}
                className="px-3 py-1 rounded bg-white text-sm text-gray-700 border"
              >
                Use demo data
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading your goals...</div>
        ) : goals.length > 0 ? (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <h4 className="font-semibold">{goal.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
                <div className="mt-3 flex gap-4 text-xs">
                  <span className="px-2 py-1 bg-slate-100 rounded">Target: {goal.target} {goal.unit}</span>
                  <span className="px-2 py-1 bg-slate-100 rounded">Weightage: {goal.weightage}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No goals yet. Create your first goal to get started.
          </div>
        )}
      </div>
    </div>
  )
}
