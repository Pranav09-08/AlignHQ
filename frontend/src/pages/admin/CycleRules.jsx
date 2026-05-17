import React, { useEffect, useState } from 'react'
import { getAdminBootstrap, setCycleRules } from '../../lib/api'

const initialRuleForm = {
  cycle_id: '',
  rule_name: '',
  description: '',
  min_goal_weightage: '10',
  max_goals_per_sheet: '8',
  allow_edit_after_submission: false,
  shared_kpi_enabled: true,
  checkin_window_start: '',
  checkin_window_end: '',
}

export default function AdminCycleRules() {
  const [bootstrap, setBootstrap] = useState({ cycles: [], cycleRules: [] })
  const [ruleForm, setRuleForm] = useState(initialRuleForm)
  const [editingRuleId, setEditingRuleId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminBootstrap()
        if (typeof data !== 'string') {
          setBootstrap({ cycles: data.cycles || [], cycleRules: data.cycleRules || [] })
        }
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
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
      await setCycleRules({
        ...ruleForm,
        min_goal_weightage: Number(ruleForm.min_goal_weightage),
        max_goals_per_sheet: Number(ruleForm.max_goals_per_sheet),
      })
      setRuleForm(initialRuleForm)
      setEditingRuleId('')
      notify('Cycle rules saved successfully')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (rule) => {
    setRuleForm({
      cycle_id: rule.cycle_id || '',
      rule_name: rule.rule_name || '',
      description: rule.description || '',
      min_goal_weightage: String(rule.min_goal_weightage ?? 10),
      max_goals_per_sheet: String(rule.max_goals_per_sheet ?? 8),
      allow_edit_after_submission: Boolean(rule.allow_edit_after_submission),
      shared_kpi_enabled: rule.shared_kpi_enabled !== false,
      checkin_window_start: rule.checkin_window_start || '',
      checkin_window_end: rule.checkin_window_end || '',
    })
    setEditingRuleId(rule.id)
  }

  const handleCancelEdit = () => {
    setRuleForm(initialRuleForm)
    setEditingRuleId('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cycle Rules</h2>
        <p className="mt-1 text-sm text-gray-600">Control goal weightage, max goals, and check-in windows.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div> : null}
      {loading ? <div className="text-sm text-gray-500">Loading data...</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cycle</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={ruleForm.cycle_id}
              onChange={(e) => setRuleForm((prev) => ({ ...prev, cycle_id: e.target.value }))}
              required
            >
              <option value="">Select cycle</option>
              {bootstrap.cycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name} ({cycle.phase})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rule name</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={ruleForm.rule_name}
                onChange={(e) => setRuleForm((prev) => ({ ...prev, rule_name: e.target.value }))}
                placeholder="Q1 2026 rules"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min goal weightage</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                type="number"
                min="10"
                max="100"
                value={ruleForm.min_goal_weightage}
                onChange={(e) => setRuleForm((prev) => ({ ...prev, min_goal_weightage: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max goals per sheet</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                type="number"
                min="1"
                value={ruleForm.max_goals_per_sheet}
                onChange={(e) => setRuleForm((prev) => ({ ...prev, max_goals_per_sheet: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={ruleForm.allow_edit_after_submission}
                  onChange={(e) => setRuleForm((prev) => ({ ...prev, allow_edit_after_submission: e.target.checked }))}
                />
                Allow edits after submission
              </label>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={ruleForm.shared_kpi_enabled}
                onChange={(e) => setRuleForm((prev) => ({ ...prev, shared_kpi_enabled: e.target.checked }))}
              />
              Shared KPI enabled
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Check-in window start</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                type="date"
                value={ruleForm.checkin_window_start}
                onChange={(e) => setRuleForm((prev) => ({ ...prev, checkin_window_start: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Check-in window end</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                type="date"
                value={ruleForm.checkin_window_end}
                onChange={(e) => setRuleForm((prev) => ({ ...prev, checkin_window_end: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              rows="3"
              value={ruleForm.description}
              onChange={(e) => setRuleForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe cycle rules"
            />
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (editingRuleId ? 'Updating...' : 'Saving...') : (editingRuleId ? 'Update cycle rules' : 'Save cycle rules')}
            </button>
            {editingRuleId ? (
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
          <h3 className="text-base font-semibold text-gray-900 mb-2">Existing Rules</h3>
          <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
            {bootstrap.cycleRules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-gray-100 p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900">{rule.rule_name}</div>
                  <div className="text-xs text-gray-500 mt-1">{rule.cycles?.name || 'Cycle'} · Max {rule.max_goals_per_sheet} goals</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleEdit(rule)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100"
                >
                  Edit
                </button>
              </div>
            ))}
            {bootstrap.cycleRules.length === 0 ? <div className="text-sm text-gray-500">No rules configured yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
