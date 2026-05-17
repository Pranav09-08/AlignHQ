import React from 'react'

export const NAV_ITEMS = {
  Employee: [
    { key: 'dashboard', label: 'Dashboard', href: '/employee' },
    { key: 'my-goals', label: 'My Goals', href: '/employee/goals' },
    { key: 'checkins', label: 'Quarterly Check-ins', href: '/employee/checkins' },
  ],
  Manager: [
    { key: 'dashboard', label: 'Dashboard', href: '/manager' },
    { key: 'team-goals', label: 'Team Goals', href: '/manager/team-goals' },
    { key: 'approvals', label: 'Pending Approvals', href: '/manager/approvals' },
  ],
  Admin: [
    { key: 'dashboard', label: 'Dashboard', href: '/admin' },
    { key: 'cycles', label: 'Cycle Management', href: '/admin/cycles' },
    { key: 'reports', label: 'Reports', href: '/admin/reports' },
  ],
}

export function Sidebar({ role, selected, onSelect }) {
  const items = NAV_ITEMS[role] || []
  return (
    <aside className="w-64 h-screen flex-shrink-0 bg-black text-white">
      <div className="p-4 border-b border-black">
        <h3 className="font-semibold">AlignHQ</h3>
        <p className="text-xs text-slate-300">{role} view</p>
      </div>
      <nav className="p-2 overflow-hidden">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onSelect && onSelect(it.key)}
            className={`w-full text-left rounded-md px-4 py-3 text-sm hover:bg-white/5 ${
              selected === it.key ? 'bg-white/10' : ''
            }`}
          >
            {it.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
