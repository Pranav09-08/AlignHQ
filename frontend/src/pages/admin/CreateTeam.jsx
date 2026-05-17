import React, { useEffect, useState } from 'react'
import { createTeam, getAdminBootstrap, updateTeam } from '../../lib/api'

const initialTeamForm = { department_id: '', name: '', description: '', manager_id: '' }

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  )
}

export default function AdminCreateTeam() {
  const [bootstrap, setBootstrap] = useState({ departments: [], managers: [], teams: [] })
  const [teamForm, setTeamForm] = useState(initialTeamForm)
  const [editingTeamId, setEditingTeamId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refreshBootstrap = async () => {
    const data = await getAdminBootstrap()
    if (typeof data !== 'string') {
      setBootstrap({
        departments: data.departments || [],
        managers: data.managers || [],
        teams: data.teams || [],
      })
    }
  }

  useEffect(() => {
    async function load() {
      try {
        await refreshBootstrap()
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
      if (editingTeamId) {
        await updateTeam(editingTeamId, teamForm)
        notify('Team updated successfully')
      } else {
        await createTeam(teamForm)
        notify('Team created successfully')
      }
      setTeamForm(initialTeamForm)
      setEditingTeamId('')
      await refreshBootstrap()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (team) => {
    setTeamForm({
      department_id: team.department_id || '',
      name: team.name || '',
      description: team.description || '',
      manager_id: team.manager_id || '',
    })
    setEditingTeamId(team.id)
  }

  const handleCancelEdit = () => {
    setTeamForm(initialTeamForm)
    setEditingTeamId('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create Team</h2>
        <p className="mt-1 text-sm text-gray-600">Group employees under a department and assign a team manager.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div> : null}
      {loading ? <div className="text-sm text-gray-500">Loading data...</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title={editingTeamId ? 'Edit Team' : 'Create Team'} subtitle="Define a new team and optionally assign a manager.">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={teamForm.department_id}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, department_id: e.target.value }))}
                required
              >
                <option value="">Select department</option>
                {bootstrap.departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Team name</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Platform Squad"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Manager</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={teamForm.manager_id}
                  onChange={(e) => setTeamForm((prev) => ({ ...prev, manager_id: e.target.value }))}
                >
                  <option value="">No manager</option>
                  {bootstrap.managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                rows="3"
                value={teamForm.description}
                onChange={(e) => setTeamForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Team purpose and responsibilities"
              />
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (editingTeamId ? 'Updating...' : 'Creating...') : (editingTeamId ? 'Update team' : 'Create team')}
              </button>
              {editingTeamId ? (
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
        </SectionCard>

        <SectionCard title="Existing Teams" subtitle="Preview of available teams">
          <div className="space-y-4 max-h-[600px] overflow-auto pr-1">
            {bootstrap.teams.map((team) => {
              const dept = bootstrap.departments.find((d) => d.id === team.department_id)
              const manager = bootstrap.managers.find((m) => m.id === team.manager_id)
              return (
                <div key={team.id} className="rounded-lg border border-gray-100 p-3 mb-2 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-gray-900">{team.name}</div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-col gap-1">
                      <span>Department: {dept ? dept.name : 'Unknown'}</span>
                      {manager ? <span>Manager: {manager.name}</span> : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEdit(team)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100"
                  >
                    Edit
                  </button>
                </div>
              )
            })}
            {bootstrap.teams.length === 0 && !loading ? <div className="text-sm text-gray-500">No teams yet.</div> : null}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
