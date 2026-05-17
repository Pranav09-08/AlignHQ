import React from 'react'
import {
  Home,
  FileText,
  CheckSquare,
  Users,
  Calendar,
  BarChart2,
  Clipboard,
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
    { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: Home },
    { key: 'cycles', label: 'Cycle Management', href: '/admin/cycles', icon: Clipboard },
    { key: 'reports', label: 'Reports', href: '/admin/reports', icon: BarChart2 },
  ],
}

export function Sidebar({ role, selected, onSelect }) {
  const items = NAV_ITEMS[role] || []
  return (
    <aside className="w-64 h-screen flex-shrink-0 bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-800">
        <h3 className="font-semibold text-white">AlignHQ</h3>
        <p className="text-xs text-gray-400">{role} view</p>
      </div>
      <nav className="p-2 overflow-hidden mt-4 space-y-1">
        {items.map((it) => {
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
              <span className={`p-2 rounded-md ${active ? 'bg-white/10' : 'bg-gray-800 text-gray-300'}`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="flex-1">{it.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
