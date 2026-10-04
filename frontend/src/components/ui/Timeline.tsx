import React from 'react'

export interface TimelineItem {
  id: string
  timestamp: string
  title: string
  description?: string
  badge?: React.ReactNode
  actor?: string
  icon?: React.ReactNode
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export const Timeline: React.FC<TimelineProps> = ({ items, className = '' }) => {
  if (items.length === 0) {
    return <div className="text-center py-6 text-xs text-slate-400">No timeline history recorded</div>
  }

  return (
    <div className={`relative pl-4 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 ${className}`}>
      {items.map((item) => (
        <div key={item.id} className="relative flex items-start gap-3">
          <div className="absolute -left-4 mt-1 w-3 h-3 rounded-full bg-white border-2 border-blue-900 ring-4 ring-slate-50" />
          <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">{item.title}</span>
              <div className="flex items-center gap-1.5">
                {item.badge}
                <span className="text-[10px] font-mono text-slate-400">{item.timestamp}</span>
              </div>
            </div>
            {item.description && <p className="text-xs text-slate-600 mt-1">{item.description}</p>}
            {item.actor && (
              <div className="text-[10px] font-medium text-slate-400 mt-1.5 flex items-center gap-1">
                <span>By:</span> <span className="text-slate-600">{item.actor}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
