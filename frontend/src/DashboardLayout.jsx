import React, { useState } from 'react'
import { Sidebar, NAV_ITEMS } from './nav'
import ProfileMenu from './components/ProfileMenu'

// Import possible page components
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeMyGoals from './pages/employee/MyGoals'
import EmployeeCheckins from './pages/employee/Checkins'

import ManagerDashboard from './pages/manager/Dashboard'
import ManagerTeamGoals from './pages/manager/TeamGoals'
import ManagerApprovals from './pages/manager/Approvals'

import AdminDashboard from './pages/admin/Dashboard'
import AdminCycles from './pages/admin/Cycles'
import AdminReports from './pages/admin/Reports'

export default function DashboardLayout({ role = 'Employee' }) {
  const items = NAV_ITEMS[role] || []
  const [selected, setSelected] = useState(items[0]?.key || 'dashboard')

  function renderContent() {
    // Employee views
    if (role === 'Employee') {
      if (selected === 'dashboard') return <EmployeeDashboard />
      if (selected === 'my-goals') return <EmployeeMyGoals />
      if (selected === 'checkins') return <EmployeeCheckins />
    }

    if (role === 'Manager') {
      if (selected === 'dashboard') return <ManagerDashboard />
      if (selected === 'team-goals') return <ManagerTeamGoals />
      if (selected === 'approvals') return <ManagerApprovals />
    }

    if (role === 'Admin') {
      if (selected === 'dashboard') return <AdminDashboard />
      if (selected === 'cycles') return <AdminCycles />
      if (selected === 'reports') return <AdminReports />
    }

    return <div>Not found</div>
  }

  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar role={role} selected={selected} onSelect={setSelected} />

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-black text-white">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <h1 className="text-lg font-semibold">{role} Dashboard</h1>
            <ProfileMenu />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-md bg-white p-6 shadow-sm">{renderContent()}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
