import React, { useEffect, useState } from 'react'
import { createDepartment, getAdminBootstrap, updateDepartment } from '../../lib/api'

const initialDepartmentForm = { name: '', description: '' }

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

export default function AdminCreateDepartment() {
  const [bootstrap, setBootstrap] = useState({ departments: [] })
  const [departmentForm, setDepartmentForm] = useState(initialDepartmentForm)
  const [editingDepartmentId, setEditingDepartmentId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refreshBootstrap = async () => {
    const data = await getAdminBootstrap()
    if (typeof data !== 'string') {
      setBootstrap({
        departments: data.departments || [],
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
      if (editingDepartmentId) {
        await updateDepartment(editingDepartmentId, departmentForm)
        notify('Department updated successfully')
      } else {
        await createDepartment(departmentForm)
        notify('Department created successfully')
      }
      setDepartmentForm(initialDepartmentForm)
      setEditingDepartmentId('')
      await refreshBootstrap()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (dept) => {
    setDepartmentForm({ name: dept.name || '', description: dept.description || '' })
    setEditingDepartmentId(dept.id)
  }

  const handleCancelEdit = () => {
    setDepartmentForm(initialDepartmentForm)
    setEditingDepartmentId('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create Department</h2>
        <p className="mt-1 text-sm text-gray-600">Add a new organizational department.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div> : null}
      {loading ? <div className="text-sm text-gray-500">Loading data...</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title={editingDepartmentId ? 'Edit Department' : 'Create Department'} subtitle="Add a new department to the organization.">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Department name</label>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={departmentForm.name}
                onChange={(e) => setDepartmentForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Engineering"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                rows="3"
                value={departmentForm.description}
                onChange={(e) => setDepartmentForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Department purpose or scope"
              />
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (editingDepartmentId ? 'Updating...' : 'Creating...') : (editingDepartmentId ? 'Update department' : 'Create department')}
              </button>
              {editingDepartmentId ? (
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

        <SectionCard title="Existing Departments" subtitle="Preview of available departments">
          <div className="space-y-4 max-h-[600px] overflow-auto pr-1">
            {bootstrap.departments.map((dept) => (
              <div key={dept.id} className="rounded-lg border border-gray-100 p-3 mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900">{dept.name}</div>
                  {dept.description ? <div className="text-xs text-gray-500 mt-1">{dept.description}</div> : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleEdit(dept)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100"
                >
                  Edit
                </button>
              </div>
            ))}
            {bootstrap.departments.length === 0 && !loading ? <div className="text-sm text-gray-500">No departments yet.</div> : null}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
