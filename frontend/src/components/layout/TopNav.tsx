import React from 'react'
import {
  Shield, Radio, Bell, Search, Command, Volume2, VolumeX,
  Sparkles, User, ChevronDown, Check
} from 'lucide-react'
import { useSentinelStore, UserRole } from '../../store/useSentinelStore'

interface TopNavProps {
  onOpenCommandPalette: () => void
  unreadCount?: number
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenCommandPalette, unreadCount = 3 }) => {
  const {
    currentRole,
    setRole,
    isWsConnected,
    isDemoMode,
    toggleDemoMode,
    audioAlertsEnabled,
    toggleAudioAlerts,
  } = useSentinelStore()

  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false)

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full Ministry Access' },
    { role: 'NATIONAL_OFFICER', label: 'National Officer', desc: 'All States & Schemes' },
    { role: 'STATE_OFFICER', label: 'State Director', desc: 'Delhi NCT Jurisdiction' },
    { role: 'DISTRICT_OFFICER', label: 'District Magistrate', desc: 'South Delhi District' },
    { role: 'INSPECTION_OFFICER', label: 'Field Auditor', desc: 'Surprise Audit Team' },
  ]

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 font-sans">
                  SKILL-SENTINEL
                </span>
                <span className="text-[10px] uppercase font-bold font-mono px-1 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  GOV-EARLY-WARNING
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                Ministry of Skill Development & Entrepreneurship • SIH 26245
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search & Command Palette Quick Trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search centres, schemes, alerts...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Live Connection, Demo Mode, Audio & RBAC */}
        <div className="flex items-center gap-2.5">
          {/* Live WS Status Indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono font-medium border ${
              isWsConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title={isWsConnected ? 'WebSocket live stream synchronized' : 'Reconnecting to telemetry feed'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isWsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isWsConnected ? 'LIVE FEED' : 'CONNECTING'}</span>
          </div>

          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemoMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
              isDemoMode
                ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Toggle Live Event Synthesis & Simulated Telemetry"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDemoMode ? 'text-amber-300' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Demo Mode:</span>
            <span>{isDemoMode ? 'ACTIVE' : 'OFF'}</span>
          </button>

          {/* Audio Alerts */}
          <button
            onClick={toggleAudioAlerts}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title={audioAlertsEnabled ? 'Audio alerts enabled' : 'Audio alerts muted'}
          >
            {audioAlertsEnabled ? (
              <Volume2 className="w-4 h-4 text-blue-900" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
                {currentRole.charAt(0)}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-[11px] font-bold text-slate-900 leading-tight">
                  {roles.find((r) => r.role === currentRole)?.label}
                </div>
                <div className="text-[9px] text-slate-400 uppercase font-mono">Role Switcher</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <>
                <div
                  onClick={() => setRoleDropdownOpen(false)}
                  className="fixed inset-0 z-10"
                />
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 divide-y divide-slate-100">
                  <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 font-mono">
                    Select Active Persona / Scope
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        setRole(r.role)
                        setRoleDropdownOpen(false)
                      }}
                      className="w-full px-3 py-2 text-left flex items-start justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className={`text-xs font-semibold ${r.role === currentRole ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                          {r.label}
                        </div>
                        <div className="text-[10px] text-slate-400">{r.desc}</div>
                      </div>
                      {r.role === currentRole && <Check className="w-4 h-4 text-blue-900 mt-0.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
