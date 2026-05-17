import React, { useEffect, useState } from 'react'
import {
  createKpiTemplate,
  getAdminBootstrap,
} from '../../lib/api'

const initialKpiForm = {
  scope: 'organization',
  department_id: '',
  team_id: '',
  cycle_id: '',
  title: '',
  description: '',
  thrust_area: '',
  uom_type: 'percentage_max',
  target: '',
  unit: '',
  default_weightage: '10',
  is_shared: true,
  is_active: true,
}

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

export default function AdminKpiTemplates() {
  const [bootstrap, setBootstrap] = useState({
    departments: [],
    teams: [],
    cycles: [],
    kpiTemplates: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [kpiForm, setKpiForm] = useState(initialKpiForm)

  const refreshBootstrap = async () => {
    const data = await getAdminBootstrap()
    if (typeof data === 'string') {
      throw new Error('Unexpected server response')
    }
    setBootstrap({
      departments: data.departments || [],
      teams: data.teams || [],
      cycles: data.cycles || [],
      kpiTemplates: data.kpiTemplates || [],
    })
  }

  useEffect(() => {
    async function load() {
      try {
        await refreshBootstrap()
      } catch (err) {
        setError(err.message || 'Failed to load KPI data')
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

  const handleCreateKpiTemplate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const normalizedDepartmentId = kpiForm.department_id || null
      const normalizedTeamId = kpiForm.team_id || null
      const normalizedCycleId = kpiForm.cycle_id || null

      await createKpiTemplate({
        ...kpiForm,
        department_id: normalizedDepartmentId,
        team_id: normalizedTeamId,
        cycle_id: normalizedCycleId,
        target: kpiForm.target === '' ? null : Number(kpiForm.target),
        default_weightage: Number(kpiForm.default_weightage),
      })
      setKpiForm(initialKpiForm)
      await refreshBootstrap()
      notify('KPI template created successfully')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const kpiScope = kpiForm.scope

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">KPI Templates</h2>
        <p className="mt-1 text-sm text-gray-600">Build reusable KPIs for organization, departments, teams, or cycles.</p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div> : null}
      {loading ? <div className="text-sm text-gray-500">Loading KPI data...</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="Create KPI Template" subtitle="Define standard goals that can be shared across the organization.">
          <form className="space-y-4" onSubmit={handleCreateKpiTemplate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Scope</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={kpiForm.scope}
                  onChange={(e) =>
                    setKpiForm((prev) => ({
                      ...prev,
                      scope: e.target.value,
                      department_id: '',
                      team_id: '',
                      cycle_id: '',
                    }))
                  }
                >
                  <option value="organization">Organization</option>
                  <option value="department">Department</option>
                  <option value="team">Team</option>
                  <option value="cycle">Cycle</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={kpiForm.title}
                  onChange={(e) => setKpiForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Monthly revenue growth"
                  required
                />
              </div>
            </div>

            {kpiScope === 'department' ? (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={kpiForm.department_id}
                  onChange={(e) => setKpiForm((prev) => ({ ...prev, department_id: e.target.value }))}
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
            ) : null}

            {kpiScope === 'team' ? (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Team</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={kpiForm.team_id}
                  onChange={(e) => setKpiForm((prev) => ({ ...prev, team_id: e.target.value }))}
                  required
                >
                  <option value="">Select team</option>
                  {bootstrap.teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {kpiScope === 'cycle' ? (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cycle</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={kpiForm.cycle_id}
                  onChange={(e) => setKpiForm((prev) => ({ ...prev, cycle_id: e.target.value }))}
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
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">UOM type</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={kpiForm.uom_type}
                  onChange={(e) => setKpiForm((prev) => ({ ...prev, uom_type: e.target.value }))}
                >
                  <option value="numeric_max">Numeric Max</option>
                  <option value="numeric_min">Numeric Min</option>
                  <option value="percentage_max">Percentage Max</option>
                  <option value="percentage_min">Percentage Min</option>
                  <option value="timeline">Timeline</option>
                  <option value="zero_based">Zero Based</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  type="number"
                  step="0.01"
                  value={kpiForm.target}
                  onChange={(e) => setKpiForm((prev) => ({ ...prev, target: e.target.value }))}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Default weightage</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  type="number"
                  min="0"
                  max="100"
                  value={kpiForm.default_weightage}
                  onChange={(e) => setKpiForm((prev) => ({ ...prev, default_weightage: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={kpiForm.unit}
                  onChange={(e) => setKpiForm((prev) => ({ ...prev, unit: e.target.value }))}
                  placeholder="% or tasks"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={kpiForm.is_shared}
                  onChange={(e) => setKpiForm((prev) => ({ ...prev, is_shared: e.target.checked }))}
                />
                Shared KPI
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={kpiForm.is_active}
                  onChange={(e) => setKpiForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                Active
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                rows="3"
                value={kpiForm.description}
                onChange={(e) => setKpiForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Explain the KPI and how it is measured"
              />
            </div>
            <button 
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create KPI template'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Active KPI Templates" subtitle="Preview of available templates">
          <div className="space-y-4 max-h-[600px] overflow-auto pr-1">
            {bootstrap.kpiTemplates.map((template) => (
              <div key={template.id} className="rounded-lg border border-gray-100 p-3 mb-2">
                <div className="font-medium text-gray-900">{template.title}</div>
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>{template.scope} · {template.uom_type}</span>
                  <span className={template.is_active ? 'text-green-600' : 'text-red-500'}>{template.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
            {bootstrap.kpiTemplates.length === 0 ? <div className="text-sm text-gray-500">No KPI templates yet.</div> : null}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
