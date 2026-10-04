import React from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  controls?: React.ReactNode
  children: React.ReactNode
  className?: string
  height?: string
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  controls,
  children,
  className = '',
  height = 'h-64',
}) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {controls && <div className="flex items-center gap-1.5">{controls}</div>}
      </div>
      <div className={`w-full ${height}`}>{children}</div>
    </div>
  )
}
