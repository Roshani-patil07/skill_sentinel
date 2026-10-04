import React from 'react'
import {
  LayoutDashboard, Building2, Video, ShieldAlert,
  Send, ClipboardCheck, QrCode, ScanEye, Database,
  BarChart2, Users, Sliders, ShieldCheck, Activity
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useSentinelStore } from '../../store/useSentinelStore'

interface NavGroup {
  groupTitle: string
  items: {
    path: string
    label: string
    icon: React.ElementType
    badge?: number | string
    badgeTone?: 'rose' | 'blue' | 'emerald'
  }[]
}

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { currentRole, centres } = useSentinelStore()

  const criticalCount = centres.filter((c) => c.current_risk_level === 'CRITICAL').length || 2

  const navigationGroups: NavGroup[] = [
    {
      groupTitle: 'Command & Analytics',
      items: [
        { path: '/dashboard', label: 'National Dashboard', icon: LayoutDashboard },
        { path: '/risk', label: 'Risk Intelligence', icon: ShieldAlert },
        { path: '/analytics', label: 'Compliance Analytics', icon: BarChart2 },
      ],
    },
    {
      groupTitle: 'Surveillance & Centres',
      items: [
        { path: '/live', label: 'Live CCTV Monitoring', icon: Video, badge: 'LIVE', badgeTone: 'rose' },
        { path: '/centres', label: 'Training Centres', icon: Building2 },
        { path: '/assets', label: 'Sanctioned Assets', icon: Database },
      ],
    },
    {
      groupTitle: 'Enforcement & Audits',
      items: [
        { path: '/interventions', label: 'Intervention Centre', icon: Send, badge: 3, badgeTone: 'rose' },
        { path: '/inspections', label: 'Field Inspections', icon: ClipboardCheck },
        { path: '/qr', label: 'QR Asset Scanner', icon: QrCode },
        { path: '/ar-inspection', label: 'AR Spatial Inspection', icon: ScanEye },
      ],
    },
    {
      groupTitle: 'Administration',
      items: [
        { path: '/users', label: 'Officer Directory', icon: Users },
        { path: '/settings', label: 'System Settings', icon: Sliders },
      ],
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14 shadow-xs">
      {/* Navigation Groups */}
      <div className="p-3.5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {group.groupTitle}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path))

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono shrink-0 ${
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
        ))}
      </div>

      {/* Footer System Status Card */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="text-[11px] font-bold text-slate-800 leading-tight">National Grid Online</div>
              <div className="text-[9px] text-slate-500 font-mono">MSDE Sentinel Node 01</div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-semibold">
            v2026.4
          </span>
        </div>
      </div>
    </aside>
  )
}
