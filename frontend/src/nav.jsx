import React, { useState } from 'react'
import {
  Home,
  FileText,
  CheckSquare,
  Users,
  Calendar,
  BarChart2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

export const NAV_ITEMS = {
  Employee: [
    { key: 'dashboard', label: 'Dashboard', href: '/employee', icon: Home },
    { key: 'my-goals', label: 'My Goals', href: '/employee/goals', icon: FileText },
    { key: 'checkins', label: 'Quarterly Check-ins', href: '/employee/checkins', icon: Calendar },
  ],
  Manager: [
    { key: 'dashboard', label: 'Dashboard', href: '/manager', icon: Home },
    { key: 'team-goals', label: 'Team Goals', href: '/manager/team-goals', icon: Users },
    { key: 'approvals', label: 'Pending Approvals', href: '/manager/approvals', icon: CheckSquare },
  ],
  Admin: [
    { key: 'dashboard', label: 'Overview', href: '/admin', icon: Home },
    {
      key: 'organization',
      label: 'Organization',
      icon: Users,
      children: [
        { key: 'create-dept', label: 'Create Department' },
        { key: 'create-team', label: 'Create Team' },
        { key: 'assign-manager', label: 'Assign Manager' },
      ],
    },
    {
      key: 'people',
      label: 'People',
      icon: Users,
      children: [
        { key: 'manage-employees', label: 'Employees' },
        { key: 'manage-managers', label: 'Managers' },
      ],
    },
    {
      key: 'cycles',
      label: 'Cycle Management',
      icon: Calendar,
      children: [
        { key: 'create-cycle', label: 'Create Cycle' },
        { key: 'cycle-rules', label: 'Cycle Rules' },
      ],
    },
    { key: 'kpi-templates', label: 'KPI Templates', href: '/admin/kpi-templates', icon: FileText },
    { key: 'reports', label: 'Reports', href: '/admin/reports', icon: BarChart2 },
  ],
}

export function Sidebar({ role, selected, onSelect }) {
  const items = NAV_ITEMS[role] || []
  const [expanded, setExpanded] = useState({
    organization: true,
    cycles: true,
    people: true,
  })

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const renderItem = (it) => {
    if (it.children) {
      const isExpanded = expanded[it.key]
      const Icon = it.icon
      // Check if any child is selected to highlight the parent slightly or keep it open
      const hasSelectedChild = it.children.some(child => child.key === selected)
      
      return (
        <div key={it.key} className="space-y-1">
          <button
            onClick={() => toggleExpand(it.key)}
            className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg text-sm transition text-gray-300 hover:bg-gray-800/60 ${
              hasSelectedChild ? 'bg-gray-800/40' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-md bg-gray-800 text-gray-400">
                <Icon className="w-4 h-4" />
              </span>
              <span className="font-medium">{it.label}</span>
            </div>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {isExpanded && (
            <div className="pl-12 pr-2 space-y-1 mt-1">
              {it.children.map(child => {
                const active = selected === child.key
                return (
                  <button
                    key={child.key}
                    onClick={() => onSelect && onSelect(child.key)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                      active
                        ? 'bg-gray-800 text-white font-medium shadow-inner'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                    }`}
                  >
                    {child.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    const Icon = it.icon
    const active = selected === it.key
    return (
      <button
        key={it.key}
        onClick={() => onSelect && onSelect(it.key)}
        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
          active
            ? 'bg-gray-800 text-white shadow-inner'
            : 'text-gray-300 hover:bg-gray-800/60'
        }`}
      >
        <span className={`p-2 rounded-md ${active ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className={active ? 'font-medium' : ''}>{it.label}</span>
      </button>
    )
  }

  return (
    <aside className="w-64 h-screen flex-shrink-0 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h3 className="font-semibold text-white tracking-wide">AtomQuest</h3>
        <p className="text-xs text-gray-400 uppercase mt-1 tracking-wider">{role} Portal</p>
      </div>
      <nav className="p-2 overflow-y-auto flex-1 mt-4 space-y-1">
        {items.map(renderItem)}
      </nav>
    </aside>
  )
}
