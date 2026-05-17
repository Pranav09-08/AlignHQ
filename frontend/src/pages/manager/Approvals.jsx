import React, { useEffect, useState } from 'react'
import { useAuth } from '../../route'
import { getManagerApprovals, reviewGoalSheet } from '../../lib/api'

const statusColors = {
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
}

function GoalRow({ goal }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-800">{goal.title}</div>
        {goal.description && (
          <div className="text-xs text-gray-500 mt-0.5">{goal.description}</div>
        )}
      </div>
      <div className="flex gap-2 text-xs shrink-0 ml-4">
        <span className="px-2 py-1 bg-slate-100 rounded">{goal.weightage}%</span>
        <span className="px-2 py-1 bg-slate-100 rounded">{goal.uom_type}</span>
      </div>
    </div>
  )
}

function SheetCard({ sheet, onReview }) {
  const [expanded, setExpanded] = useState(false)
  const [rejectMode, setRejectMode] = useState(false)
  const [reason, setReason] = useState('')
  const [isActing, setIsActing] = useState(false)

  const employee = sheet.users || {}
  const goals = sheet.goals || []
  const isPending = sheet.status === 'submitted'

  const handleApprove = async () => {
    setIsActing(true)
    try {
      await onReview(sheet.id, { action: 'approve' })
    } finally {
      setIsActing(false)
    }
  }

  const handleReject = async () => {
    if (!reason.trim()) return
    setIsActing(true)
    try {
      await onReview(sheet.id, { action: 'reject', rejectionReason: reason })
      setRejectMode(false)
      setReason('')
    } finally {
      setIsActing(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(prev => !prev)}
      >
        <div>
          <div className="font-semibold text-gray-900">{employee.name || 'Unknown'}</div>
          <div className="text-xs text-gray-500 mt-0.5">{employee.email}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColors[sheet.status] || 'bg-gray-100 text-gray-600'}`}>
            {sheet.status}
          </span>
          <span className="text-gray-400 text-xs">{goals.length} goal{goals.length !== 1 ? 's' : ''}</span>
          <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="mt-3 space-y-1">
            {goals.length > 0 ? goals.map(g => <GoalRow key={g.id} goal={g} />) : (
              <div className="text-sm text-gray-400 py-2">No goals on this sheet yet.</div>
            )}
          </div>

          {sheet.rejection_reason && (
            <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              <span className="font-semibold">Rejection reason:</span> {sheet.rejection_reason}
            </div>
          )}

          {isPending && !rejectMode && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleApprove}
                disabled={isActing}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isActing ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => setRejectMode(true)}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Reject
              </button>
            </div>
          )}

          {isPending && rejectMode && (
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-medium text-gray-700">Rejection reason</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Explain why this sheet is being returned..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={isActing || !reason.trim()}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isActing ? 'Rejecting...' : 'Confirm reject'}
                </button>
                <button
                  onClick={() => { setRejectMode(false); setReason('') }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ManagerApprovals() {
  const { user } = useAuth()
  const [cycle, setCycle] = useState(null)
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadApprovals = async () => {
    if (!user?.id) return
    const data = await getManagerApprovals(user.id)
    if (typeof data !== 'string') {
      setCycle(data.cycle || null)
      setSheets(data.sheets || [])
    }
  }

  useEffect(() => {
    setLoading(true)
    loadApprovals()
      .catch(err => setError(err.message || 'Failed to load approvals'))
      .finally(() => setLoading(false))
  }, [user?.id])

  const notify = (message) => {
    setSuccess(message)
    setTimeout(() => setSuccess(''), 2600)
  }

  const handleReview = async (sheetId, payload) => {
    try {
      setError('')
      await reviewGoalSheet(sheetId, { ...payload, reviewerId: user.id })
      await loadApprovals()
      notify(payload.action === 'approve' ? 'Goal sheet approved!' : 'Goal sheet returned with feedback.')
    } catch (err) {
      setError(err.message || 'Failed to review sheet')
    }
  }

  const pending = sheets.filter(s => s.status === 'submitted')
  const reviewed = sheets.filter(s => s.status !== 'submitted' && s.status !== 'draft')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
        <p className="mt-1 text-sm text-gray-600">Review and approve or return goal sheets submitted by your team.</p>
      </div>

      {cycle && (
        <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 inline-flex items-center gap-3 shadow-sm">
          <div className="text-xs text-gray-500">Active Cycle</div>
          <div className="font-semibold text-gray-900 text-sm">{cycle.name}</div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700">{cycle.phase}</span>
        </div>
      )}

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      {loading ? (
        <div className="text-sm text-gray-500">Loading approvals...</div>
      ) : (
        <>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Awaiting Review
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">{pending.length}</span>
            </h3>
            {pending.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                No sheets pending review. ✓
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(sheet => (
                  <SheetCard key={sheet.id} sheet={sheet} onReview={handleReview} />
                ))}
              </div>
            )}
          </div>

          {reviewed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Previously Reviewed</h3>
              <div className="space-y-3">
                {reviewed.map(sheet => (
                  <SheetCard key={sheet.id} sheet={sheet} onReview={handleReview} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
