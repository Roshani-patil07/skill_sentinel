import React, { useEffect, useState } from 'react'
import {
  ShieldAlert, Activity, Video, AlertTriangle, ArrowUpRight,
  TrendingDown, MapPin, HelpCircle, Send, CheckCircle2, ChevronRight
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { useSentinelStore } from '../store/useSentinelStore'

interface OverviewData {
  national_compliance_index: number
  total_monitored_centres: number
  critical_centres: number
  high_risk_centres: number
  moderate_risk_centres: number
  compliant_centres: number
  camera_uptime_rate: number
  open_anomalies_count: number
  state_rankings: {
    state_id: string
    state_name: string
    centres_count: number
    average_risk_score: number
    critical_centres: number
  }[]
}

export const NationalOverview: React.FC = () => {
  const {
    centres, setCentres, setSelectedCentreId, openExplainer,
    openInterventionModal, setActiveTab
  } = useSentinelStore()

  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOverview = async () => {
    try {
      const [resOverview, resCentres] = await Promise.all([
        fetch('/api/v1/analytics/overview'),
        fetch('/api/v1/centres')
      ])
      const dataOverview = await resOverview.json()
      const dataCentres = await resCentres.json()
      setOverview(dataOverview)
      setCentres(dataCentres)
    } catch (err) {
      console.error('Failed to load overview:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  const sortedCentres = [...centres].sort((a, b) => b.current_risk_score - a.current_risk_score)

  return (
    <div className="space-y-6">
      {/* Top National Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Compliance Index */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Compliance Index</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {overview?.national_compliance_index}%
          </div>
          <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold font-mono">Continuous</span> aggregate index
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${overview?.national_compliance_index}%` }}
            ></div>
          </div>
        </div>

        {/* Monitored Centres */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Total Centres</span>
            <MapPin className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {overview?.total_monitored_centres}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Across 5 Key Industrial States
          </div>
        </div>

        {/* Critical & High Risk Outliers */}
        <div className="glass-panel p-4 rounded-xl border border-red-900/50 bg-red-950/20 shadow-glow-red">
          <div className="flex items-center justify-between text-red-300 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Critical Risk Flagged</span>
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-red-400 font-mono">
            {overview?.critical_centres}
          </div>
          <div className="text-[11px] text-red-300/80 mt-2">
            Early-warning threshold breached
          </div>
        </div>

        {/* Telemetry Stream Health */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Telemetry Uptime</span>
            <Video className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {overview?.camera_uptime_rate}%
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Zero continuous video stored
          </div>
        </div>

        {/* Active Open Anomalies */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Open Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            {overview?.open_anomalies_count}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">
            Pending officer adjudication
          </div>
        </div>
      </div>

      {/* State Risk Comparison Chart & Methodology Note */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                State Compliance Risk Benchmark
              </h3>
              <p className="text-xs text-gray-400">
                Average risk score per jurisdiction (Lower is superior)
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Live Computed</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.state_rankings || []} layout="vertical">
                <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={11} />
                <YAxis dataKey="state_name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any) => [`${val} / 100`, 'Average Risk Score']}
                />
                <Bar dataKey="average_risk_score" radius={[0, 4, 4, 0]}>
                  {overview?.state_rankings.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={entry.average_risk_score > 70 ? '#ef4444' : entry.average_risk_score > 40 ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainability Callout Box */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Risk Engine Logic
              </h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              SKILL-SENTINEL continuously scores training centres from <strong>0 (Optimal) to 100 (Extreme Risk)</strong> using 4 verifiable pillars:
            </p>
            <ul className="text-xs text-gray-400 space-y-2.5 mt-3">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></span>
                <span><strong className="text-gray-200">Attendance Integrity (45%):</strong> Delta between portal biometric claims and camera vision headcount.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                <span><strong className="text-gray-200">Equipment Deficit (25%):</strong> Unverified or missing mandatory lab workstations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span><strong className="text-gray-200">Telemetry Health (15%):</strong> CCTV drops, tampering, and stream blackouts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></span>
                <span><strong className="text-gray-200">Persistence (15%):</strong> Recurring multi-day compliance flags.</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 text-[11px] text-gray-400">
            Automated recommendations guide officer intervention before subsidy disbursal.
          </div>
        </div>
      </div>

      {/* Early-Warning Priority List */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Priority Compliance Monitoring & Early-Warning Queue
            </h3>
            <p className="text-xs text-gray-400">
              Ranked dynamically by composite risk score. Click any centre to inspect live camera & attendance.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('INTEGRITY')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            View All Discrepancies <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Centre Code & Name</th>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Active Telemetry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {sortedCentres.map((centre) => {
                const isCrit = centre.current_risk_level === 'CRITICAL'
                const isHigh = centre.current_risk_level === 'HIGH'
                const isMod = centre.current_risk_level === 'MODERATE'

                return (
                  <tr
                    key={centre.id}
                    className="hover:bg-gray-800/40 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedCentreId(centre.id)
                      setActiveTab('LIVE_CAMERA')
                    }}
                  >
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {centre.name}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {centre.centre_code}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-gray-300">
                      {centre.district_name}, {centre.state_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          isCrit
                            ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                            : isHigh
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : isMod
                            ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {centre.current_risk_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sm">
                      <span
                        className={
                          isCrit
                            ? 'text-red-400'
                            : isHigh
                            ? 'text-amber-400'
                            : isMod
                            ? 'text-yellow-400'
                            : 'text-emerald-400'
                        }
                      >
                        {centre.current_risk_score} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 font-sans">
                      {centre.active_cameras} Cams • {centre.active_batches} Batches
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openExplainer(centre.id)}
                          className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 flex items-center gap-1 transition-colors"
                          title="Explain Why Risky"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                          Why Risky?
                        </button>
                        <button
                          onClick={() => openInterventionModal(centre.id)}
                          className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-200 text-xs font-medium border border-red-800 flex items-center gap-1 shadow-glow-red transition-colors"
                          title="Trigger Preventive Action"
                        >
                          <Send className="w-3.5 h-3.5 text-red-400" />
                          Take Action
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
