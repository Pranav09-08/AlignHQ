import React from 'react'

export function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-semibold mt-2 text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-2">{hint}</div>
    </div>
  )
}

export function SectionCard({ title, subtitle, children, actions }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      {children}
    </div>
  )
}

export function InfoPill({ children }) {
  return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{children}</span>
}
