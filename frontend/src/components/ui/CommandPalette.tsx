import React, { useState, useEffect } from 'react'
import {
  Search, Video, ShieldAlert, QrCode, FileText, Settings,
  AlertTriangle, ArrowRight, Zap, CheckCircle2
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  category: 'Navigation' | 'Centre' | 'Simulation' | 'Action'
  icon?: React.ReactNode
  onSelect: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  commands: CommandItem[]
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          setQuery('')
          setSelectedIndex(0)
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const filtered = React.useMemo(() => {
    if (!query) return commands
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
    )
  }, [commands, query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].onSelect()
        onClose()
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />

      <div className="relative mx-auto max-w-xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or jump to centre..."
            className="w-full px-3 py-3.5 text-sm bg-transparent border-0 focus:outline-none text-slate-900 placeholder-slate-400"
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 border border-slate-200 rounded bg-white">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No matching commands found.</div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    item.onSelect()
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    idx === selectedIndex ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded bg-slate-100 text-slate-600">
                      {item.icon || <ArrowRight className="w-3.5 h-3.5" />}
                    </div>
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with ↑↓ • Select with ↵</span>
          <span>SKILL-SENTINEL Command Hub</span>
        </div>
      </div>
    </div>
  )
}
