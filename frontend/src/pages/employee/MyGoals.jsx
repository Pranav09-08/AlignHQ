import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../route'
import {
  adjustSharedGoalWeightage,
  createEmployeeGoal,
  deleteEmployeeGoal,
  getEmployeeGoals,
  reopenGoalSheet,
  submitGoalSheet,
  updateEmployeeGoal,
} from '../../lib/api'

const initialGoalForm = {
  title: '',
  description: '',
  thrust_area: '',
  uom_type: 'numeric_max',
  target: '',
  unit: '',
  weightage: '10',
}

const uomOptions = [
  { value: 'numeric_max', label: 'Numeric (Max)' },
  { value: 'numeric_min', label: 'Numeric (Min)' },
  { value: 'percentage_max', label: 'Percentage (Max)' },
  { value: 'percentage_min', label: 'Percentage (Min)' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'zero_based', label: 'Zero Based' },
]

function SharedWeightageEditor({ sharedGoalId, currentWeightage, locked, onSaved }) {
  const [value, setValue] = useState(String(currentWeightage ?? 10))
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await adjustSharedGoalWeightage(sharedGoalId, Number(value))
      onSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={locked}
        className="border rounded px-2 py-1"
      />
      <button
        onClick={handleSave}
        disabled={saving || locked}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}

export default function EmployeeMyGoals() {
  const { user } = useAuth()
  const [cycle, setCycle] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [goals, setGoals] = useState([])
  const [sharedGoals, setSharedGoals] = useState([])
  const [goalForm, setGoalForm] = useState(initialGoalForm)
  const [editingGoalId, setEditingGoalId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingSheet, setIsSubmittingSheet] = useState(false)
  const [isReopening, setIsReopening] = useState(false)

  const rule = cycle?.cycle_rules?.[0]
  const maxGoals = rule?.max_goals_per_sheet ?? 8
  const totalWeightage = useMemo(
    () => goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0),
    [goals]
  )
  const sharedGoalIds = useMemo(
    () => new Set(sharedGoals.map((shared) => shared.parent_goal_id)),
    [sharedGoals]
  )
  // Map from parent_goal_id -> shared goal record (for weightage editing)
  const sharedGoalMap = useMemo(
    () => Object.fromEntries(sharedGoals.map(s => [s.parent_goal_id, s])),
    [sharedGoals]
  )
  const isLocked = sheet && ['submitted', 'approved'].includes(sheet.status)

  const loadGoals = async () => {
    if (!user?.id) return
    const data = await getEmployeeGoals(user.id)
    if (typeof data === 'string') throw new Error('Server returned unexpected response')
    setCycle(data.cycle || null)
    setSheet(data.sheet || null)
    setGoals(data.sheet?.goals || [])
    setSharedGoals(data.sharedGoals || [])
  }

  useEffect(() => {
    setLoading(true)
    loadGoals()
      .catch((err) => setError(err.message || 'Failed to load goals'))
      .finally(() => setLoading(false))
  }, [user?.id])

  const resetForm = () => {
    setGoalForm(initialGoalForm)
    setEditingGoalId('')
  }

  const notify = (message) => {
    setSuccess(message)
    setError('')
    setTimeout(() => setSuccess(''), 2000)
  }

  const handleSubmitGoal = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        employeeId: user.id,
        title: goalForm.title,
        description: goalForm.description || null,
        thrust_area: goalForm.thrust_area || null,
        uom_type: goalForm.uom_type,
        target: goalForm.target === '' ? null : Number(goalForm.target),
        unit: goalForm.unit || null,
        weightage: Number(goalForm.weightage),
      }

      if (editingGoalId) {
        await updateEmployeeGoal(editingGoalId, payload)
        notify('Goal updated')
      } else {
        await createEmployeeGoal(payload)
        notify('Goal added')
      }

      resetForm()
      await loadGoals()
    } catch (err) {
      setError(err.message || 'Failed to save goal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (goal) => {
    setGoalForm({
      title: goal.title || '',
      description: goal.description || '',
      thrust_area: goal.thrust_area || '',
      uom_type: goal.uom_type || 'numeric_max',
      target: goal.target ?? '',
      unit: goal.unit || '',
      weightage: String(goal.weightage ?? '10'),
    })
    setEditingGoalId(goal.id)
  }

  const handleDelete = async (goalId) => {
    if (isLocked) return
    setIsSubmitting(true)
    try {
      await deleteEmployeeGoal(goalId)
      await loadGoals()
      notify('Goal removed')
    } catch (err) {
      setError(err.message || 'Failed to delete goal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitSheet = async () => {
    if (!sheet?.id) return
    setIsSubmittingSheet(true)
    try {
      if (goals.length === 0) {
        setError('Add at least one goal before submitting')
        return
      }
      if (totalWeightage !== 100) {
        setError('Total weightage must equal 100% before submitting')
        return
      }
      await submitGoalSheet(sheet.id)
      await loadGoals()
      notify('Goals submitted for approval')
    } catch (err) {
      setError(err.message || 'Failed to submit goals')
    } finally {
      setIsSubmittingSheet(false)
    }
  }

  const handleReopen = async () => {
    if (!sheet?.id) return
    setIsReopening(true)
    try {
      await reopenGoalSheet(sheet.id)
      await loadGoals()
      notify('Goal sheet reopened — you can now edit and resubmit.')
    } catch (err) {
      setError(err.message || 'Failed to reopen sheet')
    } finally {
      setIsReopening(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading your goals...</div>
  }

  if (!cycle) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">My Goals</h2>
        <p className="text-sm text-slate-600">No active cycle available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">My Goals</h2>
        <p className="mt-1 text-sm text-slate-600">Create and manage your goals for the active cycle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="text-sm text-gray-500">Active Cycle</div>
          <div className="text-lg font-semibold mt-1">{cycle.name}</div>
          <div className="text-xs text-gray-400 mt-2">Phase: {cycle.phase} · Status: {cycle.status}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="text-sm text-gray-500">Goal Sheet Status</div>
          <div className="text-lg font-semibold mt-1">{sheet?.status || 'draft'}</div>
          <div className="text-xs text-gray-400 mt-2">Max goals: {maxGoals}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="text-sm text-gray-500">Total Weightage</div>
          <div className={`text-lg font-semibold mt-1 ${totalWeightage === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {totalWeightage}%
          </div>
          <div className="text-xs text-gray-400 mt-2">Target total: 100%</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700">{success}</div>
      )}

      {sheet?.status === 'rejected' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-red-700">Goal sheet was returned by your manager</div>
            {sheet.rejection_reason && (
              <div className="text-xs text-red-600 mt-1">Reason: {sheet.rejection_reason}</div>
            )}
          </div>
          <button
            onClick={handleReopen}
            disabled={isReopening}
            className="ml-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 shrink-0"
          >
            {isReopening ? 'Reopening...' : 'Edit & Resubmit'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-900">{editingGoalId ? 'Edit Goal' : 'Add Goal'}</h3>
          <form className="space-y-4 mt-4" onSubmit={handleSubmitGoal}>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={goalForm.title}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Improve customer response time"
                required
                disabled={isLocked}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                rows="3"
                value={goalForm.description}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Add more detail"
                disabled={isLocked}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Thrust Area</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={goalForm.thrust_area}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, thrust_area: e.target.value }))}
                placeholder="e.g., Customer Success"
                disabled={isLocked}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">UOM Type</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={goalForm.uom_type}
                  onChange={(e) => setGoalForm((prev) => ({ ...prev, uom_type: e.target.value }))}
                  disabled={isLocked}
                >
                  {uomOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Weightage (%)</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  type="number"
                  min="10"
                  max="100"
                  value={goalForm.weightage}
                  onChange={(e) => setGoalForm((prev) => ({ ...prev, weightage: e.target.value }))}
                  disabled={isLocked}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  type="number"
                  value={goalForm.target}
                  onChange={(e) => setGoalForm((prev) => ({ ...prev, target: e.target.value }))}
                  disabled={isLocked}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={goalForm.unit}
                  onChange={(e) => setGoalForm((prev) => ({ ...prev, unit: e.target.value }))}
                  disabled={isLocked}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                type="submit"
                disabled={isSubmitting || isLocked}
              >
                {isSubmitting ? (editingGoalId ? 'Updating...' : 'Adding...') : (editingGoalId ? 'Update goal' : 'Add goal')}
              </button>
              {editingGoalId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Current Goals</h3>
            <button
              type="button"
              onClick={handleSubmitSheet}
              disabled={isSubmittingSheet || isLocked || goals.length === 0}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmittingSheet ? 'Submitting...' : isLocked ? 'Submitted' : 'Submit for approval'}
            </button>
          </div>
          <div className="space-y-3 mt-4 max-h-[520px] overflow-auto pr-1">
            {goals.map((goal) => {
              const isShared = sharedGoalIds.has(goal.id)
              const sharedRecord = sharedGoalMap[goal.id]
              const canAdjust = isShared && sharedRecord?.can_adjust_weightage
              const isReadOnly = isLocked || (isShared && !canAdjust)
              return (
                <div key={goal.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">{goal.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{goal.description || 'No description'}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(goal)}
                        className={`text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isReadOnly}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(goal.id)}
                        className={`text-xs font-medium text-red-600 hover:text-red-800 px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isReadOnly}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs items-center">
                    <span className="px-2 py-1 bg-slate-100 rounded">UOM: {goal.uom_type}</span>
                    <span className="px-2 py-1 bg-slate-100 rounded">Target: {goal.target ?? '—'} {goal.unit || ''}</span>
                    {isShared ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Shared KPI</span>
                    ) : null}
                    {canAdjust ? (
                      <SharedWeightageEditor
                        sharedGoalId={sharedRecord.id}
                        currentWeightage={sharedRecord.weightage_adjusted ?? goal.weightage}
                        locked={isLocked}
                        onSaved={fetchGoals}
                      />
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 rounded">Weightage: {goal.weightage}%</span>
                    )}
                  </div>
                </div>
              )
            })}
            {goals.length === 0 ? (
              <div className="text-sm text-gray-500">No goals created yet.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
