import React, { useState } from 'react'
import { Sidebar, NAV_ITEMS } from './nav'
import ProfileMenu from './components/ProfileMenu'
import { useAuth } from './route'

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

export default function DashboardLayout() {
  const { user } = useAuth()
  const role = user?.role || 'Employee'
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
    <div className="h-screen flex bg-gray-50">
      <Sidebar role={role} selected={selected} onSelect={setSelected} />

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-gray-900 text-white shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <div>
              <h1 className="text-lg font-semibold">{role} Dashboard</h1>
              <p className="text-xs text-gray-400">Overview and quick actions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <input
                  className="px-3 py-2 rounded-md text-sm w-60 bg-gray-800 border border-gray-700 text-gray-200"
                  placeholder="Search goals, people or cycles"
                />
              </div>
              <ProfileMenu />
            </div>
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
