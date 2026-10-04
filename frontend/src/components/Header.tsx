import React from 'react'
import { Shield, Radio, UserCheck, AlertTriangle } from 'lucide-react'
import { useSentinelStore, UserRole } from '../store/useSentinelStore'

export const Header: React.FC = () => {
  const { currentRole, setRole, liveEvents } = useSentinelStore()

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'System-wide config & audit logs' },
    { id: 'NATIONAL_OFFICER', label: 'National Officer', desc: 'Ministry national compliance & state comparisons' },
    { id: 'STATE_OFFICER', label: 'State Officer', desc: 'State SSDM monitoring & district rankings' },
    { id: 'DISTRICT_OFFICER', label: 'District Officer', desc: 'District risk & surprise audit dispatch' },
    { id: 'INSPECTION_OFFICER', label: 'Inspection Officer', desc: 'Field QR asset verification & evidence' },
    { id: 'CENTRE_ADMIN', label: 'Centre Admin', desc: 'Centre profile & attendance submission' },
  ]

  const recentCritical = liveEvents.find(e => e.severity === 'CRITICAL')

  return (
    <header className="border-b border-gray-800 bg-[#0c1220]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 shadow-glow-green text-white font-bold">
            <Shield className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-white">SKILL-SENTINEL</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono">
                SIH 2026 #26245
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium tracking-tight">
              From Periodic Inspection to Continuous Compliance Intelligence
            </p>
          </div>
        </div>

        {/* Live Stream Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>REALTIME AI TELEMETRY ACTIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        {/* Multi-Role RBAC Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-700/70 p-1 rounded-lg">
            <UserCheck className="w-4 h-4 text-emerald-400 ml-1.5" />
            <span className="text-xs font-semibold text-gray-300 mr-1 hidden sm:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-gray-800 text-xs text-emerald-300 font-medium px-2 py-1 rounded border border-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Critical Alert Ticker if any */}
      {recentCritical && (
        <div className="bg-red-950/80 border-t border-b border-red-800/60 px-4 py-1.5 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce flex-shrink-0" />
            <span className="font-semibold text-red-300">[ACTIVE CRITICAL ALERT]:</span>
            <span className="truncate">{recentCritical.title}</span>
            <span className="text-[10px] text-red-400 ml-auto font-mono flex-shrink-0">
              {new Date(recentCritical.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
