import React, { useState, useContext, createContext } from 'react'
import DashboardLayout from './DashboardLayout'
import Login from './pages/Login'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    }
    return null
  })
  const [loading, setLoading] = useState(false)

  const loginWithBackend = async (email, password) => {
    setLoading(true)
    try {
      const response = await fetch('https://alignhq.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      const userData = data.user

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData))
      }
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loginWithBackend, logout, loading }}>
      {children}
    </AuthContext.Provider>
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

  if (!user) {
    return <Login />
  }

  return (
    <ProtectedRoute allowed={["Employee", "Manager", "Admin"]}>
      <DashboardLayout role={user.role} />
    </ProtectedRoute>
  )
}
