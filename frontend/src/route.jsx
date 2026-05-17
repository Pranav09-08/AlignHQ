import React, { useState, useContext, createContext } from 'react'
import DashboardLayout from './DashboardLayout'
import EmployeeDashboard from './pages/employee/Dashboard'
import ManagerDashboard from './pages/manager/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'

// Simple AuthContext mock — replace with real auth later
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Read role from localStorage for dev convenience
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') || 'Employee' : 'Employee'
    return { name: 'Demo User', role }
  })

  const loginAs = (role) => {
    if (typeof window !== 'undefined') localStorage.setItem('role', role)
    setUser((u) => ({ ...u, role }))
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('role')
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loginAs, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

function ProtectedRoute({ allowed = [], children }) {
  const { user } = useAuth()
  if (!user || !allowed.includes(user.role)) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="mt-2 text-sm text-slate-600">You do not have permission to view this page.</p>
      </div>
    )
  }
  return children
}

export default function AppRoutes() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowed={["Employee", "Manager", "Admin"]}>
      <DashboardLayout role={user.role} />
    </ProtectedRoute>
  )
}
