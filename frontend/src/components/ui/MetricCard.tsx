import React from 'react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  delta?: {
    value: string
    isPositive?: boolean
    neutral?: boolean
  }
  subtext?: string
  icon?: React.ReactNode
  variant?: 'default' | 'healthy' | 'warning' | 'critical' | 'navy'
  className?: string
  onClick?: () => void
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  delta,
  subtext,
  icon,
  variant = 'default',
  className = '',
  onClick,
}) => {
  let borderHighlight = 'border-slate-200'
  let iconBg = 'bg-slate-100 text-slate-700'

  if (variant === 'healthy') {
    borderHighlight = 'border-l-4 border-l-emerald-600 border-slate-200'
    iconBg = 'bg-emerald-50 text-emerald-700'
  } else if (variant === 'warning') {
    borderHighlight = 'border-l-4 border-l-amber-500 border-slate-200'
    iconBg = 'bg-amber-50 text-amber-800'
  } else if (variant === 'critical') {
    borderHighlight = 'border-l-4 border-l-rose-600 border-slate-200'
    iconBg = 'bg-rose-50 text-rose-700'
  } else if (variant === 'navy') {
    borderHighlight = 'border-l-4 border-l-blue-900 border-slate-200'
    iconBg = 'bg-blue-50 text-blue-900'
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border p-4 shadow-sm transition-all ${borderHighlight} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        {icon && <div className={`p-2 rounded-md ${iconBg}`}>{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-sans tracking-tight text-slate-900 font-tabular">
          {value}
        </span>
        {delta && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              delta.neutral
                ? 'text-slate-500'
                : delta.isPositive
                ? 'text-emerald-700'
                : 'text-rose-700'
            }`}
          >
            {delta.neutral ? (
              <Minus className="w-3.5 h-3.5 mr-0.5" />
            ) : delta.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {delta.value}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-slate-500 mt-1 leading-snug">{subtext}</p>}
    </div>
  )
}
