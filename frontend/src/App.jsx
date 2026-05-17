import React from 'react'
import { AuthProvider } from './route'
import AppRoutes from './route'

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
