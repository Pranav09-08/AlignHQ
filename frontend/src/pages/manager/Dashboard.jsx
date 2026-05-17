import React, { useState, useEffect } from 'react'
import { useAuth } from '../../route'
import { getPendingApprovals, getManagerTeamGoals } from '../../lib/api'

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [approvals, setApprovals] = useState([])
  const [teamGoals, setTeamGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchApprovals() {
      try {
        if (!user?.id) return
        const data = await getPendingApprovals(user.id)
        setApprovals(data.approvals || [])
      } catch (err) {
        setError(err.message)
        console.error('Error fetching pending approvals:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchApprovals()
  }, [user?.id])

  useEffect(() => {
    async function fetchTeamGoals() {
      try {
        if (!user?.id) return
        const data = await getManagerTeamGoals(user.id)
        if (typeof data === 'string') return
        setTeamGoals(data.goals || [])
      } catch (e) {
        // ignore
      }
    }
    fetchTeamGoals()
  }, [user?.id])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
        <p className="mt-1 text-sm text-slate-600">Department Manager</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Pending Approvals</div>
            <div className="text-2xl font-semibold mt-1">{approvals.length}</div>
            <div className="text-xs text-gray-400 mt-2">Awaiting your review</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Team Goals</div>
            <div className="text-2xl font-semibold mt-1">{teamGoals.length}</div>
            <div className="text-xs text-gray-400 mt-2">Active goals across team</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Avg Team Progress</div>
            <div className="text-2xl font-semibold mt-1">{teamGoals.length > 0 ? `${Math.round((teamGoals.reduce((s, g) => s + (g.progress || 0), 0) / teamGoals.length) * 100)}%` : '0%'}</div>
            <div className="text-xs text-gray-400 mt-2">Approximate</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading pending approvals...</div>
        ) : approvals.length > 0 ? (
          <div className="grid gap-4">
            {approvals.map((approval) => (
              <div key={approval.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{approval.employee_name}</h4>
                    <p className="text-sm text-slate-600">{approval.employee_email}</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Pending</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">Submitted on: {new Date(approval.submitted_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No pending approvals. All goal sheets are up to date!
          </div>
        )}
      </div>
    </div>
  )
}
