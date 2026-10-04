import React from 'react'
import { Filter, RotateCcw } from 'lucide-react'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  value: string
  onChange: (val: string) => void
}

interface FilterBarProps {
  filters: FilterConfig[]
  onReset?: () => void
  children?: React.ReactNode
  className?: string
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onReset,
  children,
  className = '',
}) => {
  const hasActiveFilters = filters.some((f) => f.value && f.value !== 'ALL')

  return (
    <div className={`bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2.5 flex-wrap flex-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
          <Filter className="w-3.5 h-3.5 text-blue-900" />
          <span>Filters</span>
        </div>

        {filters.map((f) => (
          <div key={f.key} className="flex items-center">
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white transition-colors cursor-pointer"
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {f.label}: {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {children}
      </div>

      {hasActiveFilters && onReset && (
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  )
}
