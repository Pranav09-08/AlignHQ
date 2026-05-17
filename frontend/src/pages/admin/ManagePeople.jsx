import React, { useEffect, useState } from 'react'
import { createUser, getAdminBootstrap } from '../../lib/api'

const initialUserForm = { name: '', email: '', role: 'Employee', department_id: '', team_id: '', manager_id: '' }

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

export default function AdminManagePeople() {
  const [bootstrap, setBootstrap] = useState({ departments: [], teams: [], employees: [], managers: [] })
  const [userForm, setUserForm] = useState(initialUserForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refreshBootstrap = async () => {
    const data = await getAdminBootstrap()
    if (typeof data !== 'string') {
      setBootstrap({
        departments: data.departments || [],
        teams: data.teams || [],
        employees: data.employees || [],
        managers: data.managers || [],
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
      await createUser(userForm)
      setUserForm(initialUserForm)
      await refreshBootstrap()
      notify('User created successfully. Default password is password123')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleFilteredTeams = bootstrap.teams.filter(t => t.department_id === userForm.department_id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manage People</h2>
        <p className="mt-1 text-sm text-gray-600">Create and manage employees and managers.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div> : null}
      {loading ? <div className="text-sm text-gray-500">Loading data...</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="Create User" subtitle="Add a new employee or manager to the platform.">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={userForm.name}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={userForm.role}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
                  required
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={userForm.department_id}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, department_id: e.target.value, team_id: '' }))}
                  required
                >
                  <option value="">Select department</option>
                  {bootstrap.departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Team (Optional)</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={userForm.team_id}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, team_id: e.target.value }))}
                  disabled={!userForm.department_id}
                >
                  <option value="">Select team</option>
                  {roleFilteredTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Manager (Optional)</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={userForm.manager_id}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, manager_id: e.target.value }))}
                >
                  <option value="">No manager</option>
                  {bootstrap.managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create user'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="People Directory" subtitle="All employees and managers in the system.">
          <div className="space-y-4 max-h-[600px] overflow-auto pr-1">
            {[...bootstrap.managers, ...bootstrap.employees].map((person) => {
              const dept = bootstrap.departments.find(d => d.id === person.department_id)
              const team = bootstrap.teams.find(t => t.id === person.team_id)
              return (
                <div key={person.id} className="rounded-lg border border-gray-100 p-3 mb-2 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">{person.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{person.email}</div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${person.role === 'Manager' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {person.role}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {dept ? dept.name : 'No Dept'} {team ? `· ${team.name}` : ''}
                    </div>
                  </div>
                </div>
              )
            })}
            {bootstrap.employees.length === 0 && bootstrap.managers.length === 0 && !loading ? (
              <div className="text-sm text-gray-500">No people found.</div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
