import React, { useEffect, useState } from 'react'
import { createCycle, getAdminCycles, updateCycle } from '../../lib/api'

const initialCycleForm = { name: '', phase: 'goal_setting', window_open: '', window_close: '', status: 'upcoming' }

export default function AdminCreateCycle() {
  const [cycleForm, setCycleForm] = useState(initialCycleForm)
  const [editingCycleId, setEditingCycleId] = useState('')
  const [cycles, setCycles] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refreshCycles = async () => {
    const data = await getAdminCycles()
    if (typeof data !== 'string') {
      setCycles(data.cycles || [])
    }
  }

  useEffect(() => {
    refreshCycles().catch((err) => setError(err.message || 'Failed to load cycles'))
  }, [])

  const notify = (message) => {
    setSuccess(message)
    setError('')
    window.clearTimeout(notify.timeout)
    notify.timeout = window.setTimeout(() => setSuccess(''), 2600)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingCycleId) {
        await updateCycle(editingCycleId, cycleForm)
        notify('Cycle updated successfully')
      } else {
        await createCycle(cycleForm)
        notify('Cycle created successfully')
      }
      setCycleForm(initialCycleForm)
      setEditingCycleId('')
      await refreshCycles()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (cycle) => {
    setCycleForm({
      name: cycle.name || '',
      phase: cycle.phase || 'goal_setting',
      window_open: cycle.window_open ? new Date(cycle.window_open).toISOString().slice(0, 16) : '',
      window_close: cycle.window_close ? new Date(cycle.window_close).toISOString().slice(0, 16) : '',
      status: cycle.status || 'upcoming',
    })
    setEditingCycleId(cycle.id)
  }

  const handleCancelEdit = () => {
    setCycleForm(initialCycleForm)
    setEditingCycleId('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create Cycle</h2>
        <p className="mt-1 text-sm text-gray-600">Set goal-setting or check-in cycles for the organization.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cycle name</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={cycleForm.name}
                onChange={(e) => setCycleForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Q1 2026"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phase</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={cycleForm.phase}
                onChange={(e) => setCycleForm((prev) => ({ ...prev, phase: e.target.value }))}
              >
                <option value="goal_setting">Goal Setting</option>
                <option value="q1">Q1</option>
                <option value="q2">Q2</option>
                <option value="q3">Q3</option>
                <option value="q4">Q4</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Window open</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                type="datetime-local"
                value={cycleForm.window_open}
                onChange={(e) => setCycleForm((prev) => ({ ...prev, window_open: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Window close</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                type="datetime-local"
                value={cycleForm.window_close}
                onChange={(e) => setCycleForm((prev) => ({ ...prev, window_close: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={cycleForm.status}
              onChange={(e) => setCycleForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (editingCycleId ? 'Updating...' : 'Creating...') : (editingCycleId ? 'Update cycle' : 'Create cycle')}
            </button>
            {editingCycleId ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Existing Cycles</h3>
          <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
            {cycles.map((cycle) => (
              <div key={cycle.id} className="rounded-lg border border-gray-100 p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900">{cycle.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{cycle.phase} · {cycle.status}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleEdit(cycle)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100"
                >
                  Edit
                </button>
              </div>
            ))}
            {cycles.length === 0 ? <div className="text-sm text-gray-500">No cycles created yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
