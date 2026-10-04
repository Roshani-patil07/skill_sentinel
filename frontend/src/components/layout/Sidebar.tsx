import React from 'react'
import {
  LayoutDashboard, Building2, Video, ShieldAlert,
  Send, ClipboardCheck, QrCode, ScanEye, Database,
  BarChart2, Users, Sliders, MessageSquare, ExternalLink
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSentinelStore } from '../../store/useSentinelStore'

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  badge?: number | string
  badgeTone?: 'rose' | 'blue' | 'amber'
}

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { currentRole } = useSentinelStore()

  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'National Dashboard', icon: LayoutDashboard },
    { path: '/centres', label: 'Training Centres', icon: Building2 },
    { path: '/live', label: 'Live Monitoring', icon: Video, badge: 'LIVE', badgeTone: 'rose' },
    { path: '/risk', label: 'Risk Intelligence', icon: ShieldAlert },
    { path: '/interventions', label: 'Intervention Centre', icon: Send, badge: 3, badgeTone: 'rose' },
    { path: '/inspections', label: 'Field Inspections', icon: ClipboardCheck },
    { path: '/qr', label: 'QR Asset Scanner', icon: QrCode },
    { path: '/ar-inspection', label: 'AR Room Inspection', icon: ScanEye },
    { path: '/assets', label: 'Sanctioned Assets', icon: Database },
    { path: '/analytics', label: 'Compliance Analytics', icon: BarChart2 },
    { path: '/users', label: 'User Directory', icon: Users },
    { path: '/settings', label: 'System Settings', icon: Sliders },
  ]

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14">
      {/* Primary Navigation List */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Command Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isActive
                      ? 'bg-blue-800 text-blue-100 border border-blue-700'
                      : item.badgeTone === 'rose'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer Status & Help */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <div className="text-[11px] font-medium text-slate-500">
          <span className="font-bold text-slate-700 block">MSDE Sentinel Node 01</span>
          <span className="text-[10px] text-slate-400 font-mono">Build 2026.4 • SIH Edition</span>
        </div>
      </div>
    </aside>
  )
}
