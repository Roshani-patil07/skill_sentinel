import React from 'react'
import { Search as SearchIcon, X } from 'lucide-react'

interface SearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  shortcutHint?: string
}

export const Search: React.FC<SearchProps> = ({
  value,
  onChange,
  placeholder = 'Search centres, schemes, asset tags...',
  className = '',
  shortcutHint,
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <SearchIcon className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-12 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all shadow-sm"
      />
      {value ? (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : shortcutHint ? (
        <span className="absolute right-3 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-400">
          {shortcutHint}
        </span>
      ) : null}
    </div>
  )
}
