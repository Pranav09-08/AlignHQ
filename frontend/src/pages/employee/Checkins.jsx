import React, { useEffect, useState } from 'react'
import { useAuth } from '../../route'
import { getEmployeeCheckins, saveGoalCheckin } from '../../lib/api'

const statusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'on_track', label: 'On Track' },
  { value: 'completed', label: 'Completed' },
]

const statusColors = {
  not_started: 'bg-gray-100 text-gray-600',
  on_track: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
}

function CheckinCard({ goal, achievement, cycleId, onSaved }) {
  const [form, setForm] = useState({
    actual_achievement: achievement?.actual_achievement ?? '',
    achievement_status: achievement?.achievement_status ?? 'not_started',
    progress_score: achievement?.progress_score ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveGoalCheckin(goal.id, {
        cycleId,
        actual_achievement: form.actual_achievement === '' ? null : Number(form.actual_achievement),
        achievement_status: form.achievement_status,
        progress_score: Number(form.progress_score),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-gray-900">{goal.title}</div>
          {goal.description && <div className="text-xs text-gray-500 mt-0.5">{goal.description}</div>}
        </div>
        <div className="flex gap-2 text-xs shrink-0 ml-4">
          <span className="px-2 py-1 bg-slate-100 rounded">Target: {goal.target ?? '—'} {goal.unit || ''}</span>
          <span className="px-2 py-1 bg-slate-100 rounded">{goal.weightage}%</span>
          {achievement && (
            <span className={`px-2 py-1 rounded-full font-bold uppercase tracking-wide ${statusColors[achievement.achievement_status] || 'bg-gray-100'}`}>
              {achievement.achievement_status.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Actual Achievement</label>
          <input
            type="number"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.actual_achievement}
            onChange={e => setForm(prev => ({ ...prev, actual_achievement: e.target.value }))}
            placeholder={goal.target ?? '0'}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.achievement_status}
            onChange={e => setForm(prev => ({ ...prev, achievement_status: e.target.value }))}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Progress Score (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.progress_score}
            onChange={e => setForm(prev => ({ ...prev, progress_score: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save progress'}
        </button>
        {saved && <span className="text-xs text-emerald-600 font-medium">✓ Saved!</span>}
      </div>
    </div>
  )
}

export default function EmployeeCheckins() {
  const { user } = useAuth()
  const [cycle, setCycle] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [goals, setGoals] = useState([])
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCheckins = async () => {
    if (!user?.id) return
    const data = await getEmployeeCheckins(user.id)
    if (typeof data !== 'string') {
      setCycle(data.cycle || null)
      setSheet(data.sheet || null)
      setGoals(data.sheet?.goals || [])
      setAchievements(data.achievements || [])
    }
  }

  useEffect(() => {
    setLoading(true)
    loadCheckins()
      .catch(err => setError(err.message || 'Failed to load check-ins'))
      .finally(() => setLoading(false))
  }, [user?.id])

  if (loading) return <div className="text-sm text-gray-500 py-8">Loading check-ins...</div>

  if (!cycle) {
    return (
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Quarterly Check-ins</h2>
        <p className="text-sm text-gray-600">No active cycle available yet. Check back when a cycle is opened.</p>
      </div>
    )
  }

  if (!sheet || sheet.status === 'draft') {
    return (
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Quarterly Check-ins</h2>
        <p className="text-sm text-gray-600">Your goal sheet hasn't been submitted yet. Please submit it first to enable check-ins.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Quarterly Check-ins</h2>
        <p className="mt-1 text-sm text-gray-600">Update your progress against each goal for the current cycle.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-500">Cycle</div>
          <div className="font-semibold text-gray-900 mt-1">{cycle.name}</div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-500">Phase</div>
          <div className="font-semibold text-gray-900 mt-1 capitalize">{cycle.phase}</div>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-500">Sheet Status</div>
          <div className={`font-semibold mt-1 capitalize ${sheet.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}>{sheet.status}</div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
            No goals found on your sheet.
          </div>
        ) : (
          goals.map(goal => {
            const achievement = achievements.find(a => a.goal_id === goal.id)
            return (
              <CheckinCard
                key={goal.id}
                goal={goal}
                achievement={achievement}
                cycleId={cycle.id}
                onSaved={loadCheckins}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
