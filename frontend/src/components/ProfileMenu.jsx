import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../route'

export default function ProfileMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-3 rounded-full bg-transparent px-2 py-1 text-sm text-white focus:outline-none"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200">
          {user.name?.charAt(0) || 'U'}
        </span>
        <svg className="h-4 w-4 text-white opacity-80 group-hover:opacity-100" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-md border border-gray-200 bg-white shadow-lg z-20">
          <div className="p-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-700 flex">{user.name?.charAt(0) || 'U'}</div>
              <div>
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
            </div>
          </div>
          <div className="border-t px-4 py-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.confirm('Are you sure you want to logout?')) {
                  logout()
                }
                setOpen(false)
              }}
              className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
