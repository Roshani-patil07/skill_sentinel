import React from 'react'
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react'

interface AlertCardProps {
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS' | string
  title: string
  description: string
  timestamp?: string
  centreName?: string
  centreCode?: string
  actions?: React.ReactNode
  onActionClick?: () => void
  actionLabel?: string
  className?: string
}

export const AlertCard: React.FC<AlertCardProps> = ({
  severity,
  title,
  description,
  timestamp,
  centreName,
  centreCode,
  actions,
  onActionClick,
  actionLabel = 'Inspect',
  className = '',
}) => {
  const norm = (severity || '').toUpperCase()

  let borderTone = 'border-slate-200 bg-white'
  let icon = <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
  let badgeTone = 'bg-blue-50 text-blue-700 border-blue-200'

  if (norm === 'CRITICAL' || norm === 'HIGH') {
    borderTone = 'border-l-4 border-l-rose-600 border-rose-200 bg-rose-50/20'
    icon = <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
    badgeTone = 'bg-rose-100 text-rose-800 border-rose-200'
  } else if (norm === 'WARNING' || norm === 'MODERATE') {
    borderTone = 'border-l-4 border-l-amber-500 border-amber-200 bg-amber-50/20'
    icon = <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
    badgeTone = 'bg-amber-100 text-amber-800 border-amber-200'
  } else if (norm === 'SUCCESS') {
    borderTone = 'border-l-4 border-l-emerald-600 border-emerald-200 bg-emerald-50/20'
    icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
    badgeTone = 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }

  return (
    <div className={`p-4 rounded-lg border shadow-sm ${borderTone} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">{icon}</div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border font-mono ${badgeTone}`}>
                {norm}
              </span>
              <h5 className="text-xs font-bold text-slate-900">{title}</h5>
            </div>
            {(centreName || centreCode) && (
              <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                {centreName} {centreCode && <span className="font-mono text-slate-400">({centreCode})</span>}
              </div>
            )}
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{description}</p>
            {timestamp && <div className="text-[10px] text-slate-400 font-mono mt-1.5">{timestamp}</div>}
          </div>
        </div>

        {actions ? (
          <div className="flex-shrink-0">{actions}</div>
        ) : onActionClick ? (
          <button
            onClick={onActionClick}
            className="flex-shrink-0 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 flex items-center gap-1 shadow-sm transition-colors"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
