import React from 'react'

interface RiskBadgeProps {
  score: number
  level?: string
  showScore?: boolean
  className?: string
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, level, showScore = true, className = '' }) => {
  let computedLevel = level
  if (!computedLevel) {
    if (score < 40) computedLevel = 'LOW'
    else if (score < 70) computedLevel = 'MODERATE'
    else if (score < 85) computedLevel = 'HIGH'
    else computedLevel = 'CRITICAL'
  }

  let style = 'bg-slate-100 text-slate-800 border-slate-200'
  if (computedLevel === 'LOW') {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-300'
  } else if (computedLevel === 'MODERATE') {
    style = 'bg-amber-50 text-amber-900 border-amber-300'
  } else if (computedLevel === 'HIGH') {
    style = 'bg-orange-50 text-orange-900 border-orange-300'
  } else if (computedLevel === 'CRITICAL') {
    style = 'bg-rose-50 text-rose-900 border-rose-300 font-bold animate-pulse'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border font-mono ${style} ${className}`}>
      {showScore && <span className="font-bold">{Math.round(score)}/100</span>}
      <span className="text-[10px] font-semibold uppercase tracking-wider">
        [{computedLevel}]
      </span>
    </span>
  )
}
