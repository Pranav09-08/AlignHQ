import React, { useEffect, useState } from 'react'
import { assignEmployeeManager, getAdminBootstrap } from '../../lib/api'

const initialAssignmentForm = { employee_id: '', manager_id: '' }

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

export default function AdminAssignManager() {
  const [bootstrap, setBootstrap] = useState({ employees: [], managers: [] })
  const [assignmentForm, setAssignmentForm] = useState(initialAssignmentForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refreshBootstrap = async () => {
    const data = await getAdminBootstrap()
    if (typeof data !== 'string') {
      setBootstrap({
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
      await assignEmployeeManager(assignmentForm.employee_id, assignmentForm.manager_id)
      setAssignmentForm(initialAssignmentForm)
      await refreshBootstrap() // Refresh to show updated mapped staff
      notify('Manager assigned to employee')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (employee) => {
    setAssignmentForm({
      employee_id: employee.id,
      manager_id: employee.manager_id || '',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Assign Manager</h2>
        <p className="mt-1 text-sm text-gray-600">Admin controls reporting lines and accountability.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div> : null}
      {loading ? <div className="text-sm text-gray-500">Loading data...</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="Assign Manager" subtitle="Set or update the manager for an employee.">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={assignmentForm.employee_id}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, employee_id: e.target.value }))}
                required
              >
                <option value="">Select employee</option>
                {bootstrap.employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} — {employee.email} {employee.manager_id ? '(Has Manager)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Manager</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={assignmentForm.manager_id}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, manager_id: e.target.value }))}
              >
                <option value="">Unassign manager</option>
                {bootstrap.managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} — {manager.email}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save assignment'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Assigned Managers" subtitle="List of employees and their managers">
          <div className="space-y-4 max-h-[600px] overflow-auto pr-1">
            {bootstrap.employees.map((employee) => {
              const manager = bootstrap.managers.find((m) => m.id === employee.manager_id)
              return (
                <div key={employee.id} className="rounded-lg border border-gray-100 p-3 flex justify-between items-center group mb-2 hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Manager: {manager ? manager.name : <span className="italic text-gray-400">Unassigned</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(employee)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100"
                  >
                    Edit
                  </button>
                </div>
              )
            })}
            {bootstrap.employees.length === 0 && !loading ? <div className="text-sm text-gray-500">No employees found.</div> : null}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
