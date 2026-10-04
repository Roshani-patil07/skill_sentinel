import React, { useEffect, useState } from 'react'
import {
  Building2, CheckCircle2, AlertTriangle, AlertOctagon,
  ShieldCheck, HardDrive, Bell, Send, ArrowRight,
  TrendingUp, TrendingDown, Eye, DollarSign, Users, Award
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { MetricCard } from '../components/ui/MetricCard'
import { RiskBadge } from '../components/ui/RiskBadge'
import { StatusBadge } from '../components/ui/StatusBadge'
import { AlertCard } from '../components/ui/AlertCard'
import { IndiaRiskMap } from '../components/ui/IndiaRiskMap'
import { LoadingState } from '../components/ui/LoadingState'
import { useSentinelStore } from '../store/useSentinelStore'
import { MOCK_CENTRES, MOCK_DISCREPANCIES, MOCK_RADAR_SUMMARY } from '../data/mockData'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { centres, setCentres, setSelectedCentreId, openInterventionModal } = useSentinelStore()
  const [loading, setLoading] = useState(false)
  const [radar, setRadar] = useState<any>(MOCK_RADAR_SUMMARY)
  const [anomalies, setAnomalies] = useState<any[]>(MOCK_DISCREPANCIES)

  const loadData = async () => {
    try {
      const [centresRes, radarRes, anomaliesRes] = await Promise.all([
        fetch('/api/v1/centres').catch(() => null),
        fetch('/api/v1/risk/radar').catch(() => null),
        fetch('/api/v1/vision/anomalies').catch(() => null),
      ])

      if (centresRes && centresRes.ok) {
        const centresData = await centresRes.json().catch(() => null)
        if (Array.isArray(centresData) && centresData.length > 0) {
          setCentres(centresData)
        }
      }

      if (radarRes && radarRes.ok) {
        const radarData = await radarRes.json().catch(() => null)
        if (radarData) setRadar(radarData)
      }

      if (anomaliesRes && anomaliesRes.ok) {
        const anomaliesData = await anomaliesRes.json().catch(() => null)
        if (Array.isArray(anomaliesData) && anomaliesData.length > 0) {
          setAnomalies(anomaliesData)
        }
      }
    } catch (err: any) {
      console.warn('Live API sync offline, using local national mock command store:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const displayCentres = centres.length > 0 ? centres : MOCK_CENTRES

  // Calculate high-level compliance metrics
  const total = displayCentres.length
  const healthy = displayCentres.filter((c) => (c.current_risk_score || 0) < 40).length
  const watchlist = displayCentres.filter((c) => (c.current_risk_score || 0) >= 40 && (c.current_risk_score || 0) < 70).length
  const highRisk = displayCentres.filter((c) => (c.current_risk_score || 0) >= 70 && (c.current_risk_score || 0) < 85).length
  const critical = displayCentres.filter((c) => (c.current_risk_score || 0) >= 85).length

  const avgRisk = displayCentres.reduce((acc, c) => acc + (c.current_risk_score || 0), 0) / (total || 1)
  const nationalCompliance = Math.max(0, Math.round(100 - avgRisk))

  // Map centres for IndiaRiskMap
  const geoCentres = displayCentres.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.centre_code,
    risk: c.current_risk_score,
    level: c.current_risk_level,
    district: c.district_name || 'District',
    state: c.state_name || 'State',
  }))

  const handleSelectCentre = (id: string) => {
    setSelectedCentreId(id)
    navigate(`/centres/${id}`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            National Command Overview • Ministry of Skill Development & Entrepreneurship
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            National Compliance & Early-Warning Command Grid
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/live')}
            className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-blue-200" />
            <span>Open Live Feeds</span>
          </button>
        </div>
      </div>

      {/* Row 1: High-Level National Impact & Vigilance Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            ₹
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Subsidy Saved</div>
            <div className="text-lg font-bold text-slate-900 font-tabular">₹18.42 Cr</div>
            <div className="text-[10px] text-emerald-600 font-medium">Ghost leakage prevented</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Daily Trainees</div>
            <div className="text-lg font-bold text-slate-900 font-tabular">14,820</div>
            <div className="text-[10px] text-slate-500 font-medium">Aadhaar cross-verified</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Sanctioned Assets</div>
            <div className="text-lg font-bold text-slate-900 font-tabular">428 Units</div>
            <div className="text-[10px] text-slate-500 font-medium">Under active AI telemetry</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Ghost Flagged</div>
            <div className="text-lg font-bold text-rose-700 font-tabular">1,482 Cases</div>
            <div className="text-[10px] text-rose-600 font-medium">Under active inquiry</div>
          </div>
        </div>
      </div>

      {/* Row 2: Centre Risk Tier Distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <MetricCard
          label="Total Centres"
          value={total}
          icon={<Building2 className="w-4 h-4 text-slate-700" />}
          subtext="10 States • 30 Districts"
          variant="navy"
          onClick={() => navigate('/centres')}
        />
        <MetricCard
          label="Healthy Tier"
          value={healthy}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          subtext="Compliance Risk < 40"
          variant="healthy"
        />
        <MetricCard
          label="Watchlist Tier"
          value={watchlist}
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          subtext="Risk Score 40 – 69"
          variant="warning"
        />
        <MetricCard
          label="High Risk Tier"
          value={highRisk}
          icon={<AlertOctagon className="w-4 h-4 text-orange-600" />}
          subtext="Risk Score 70 – 84"
          variant="critical"
        />
        <MetricCard
          label="Critical Action Tier"
          value={critical}
          icon={<AlertOctagon className="w-4 h-4 text-rose-600" />}
          subtext="Immediate Intervention"
          variant="critical"
        />
      </div>

      {/* Row 3: India Hierarchical Geographic Risk Heatmap & Urgent Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: India -> State -> District -> Centre Drilldown Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>National Risk Distribution Heatmap</span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">
                (Click state or district to filter drilldown)
              </span>
            </h3>
          </div>

          <IndiaRiskMap centres={geoCentres} onSelectCentre={handleSelectCentre} />
        </div>

        {/* Right: Urgent At-Risk Centres Watchlist & Live Telemetry Feed */}
        <div className="space-y-4 flex flex-col justify-between">
          <Card
            title="Priority Intervention Watchlist"
            subtitle="Centres exceeding statutory audit threshold"
            action={
              <button
                onClick={() => navigate('/centres')}
                className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-0.5"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-2.5">
              {displayCentres
                .slice()
                .sort((a, b) => (b.current_risk_score || 0) - (a.current_risk_score || 0))
                .slice(0, 4)
                .map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCentre(c.id)}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {c.name}
                      </span>
                      <RiskBadge score={c.current_risk_score} level={c.current_risk_level} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{c.district_name}, {c.state_name}</span>
                      <span className="font-mono text-slate-400 font-semibold">{c.centre_code}</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Recent Anomaly Alerts Card */}
          <Card
            title="Active Early Warning Ticker"
            subtitle="Real-time optical & biometric mismatches"
            action={
              <button
                onClick={() => navigate('/interventions')}
                className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-0.5"
              >
                Intervene <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-2">
              {anomalies.slice(0, 2).map((a) => (
                <div key={a.id} className="p-3 rounded-lg border border-rose-200 bg-rose-50/60 text-xs">
                  <div className="flex items-center justify-between font-bold text-rose-900 mb-1">
                    <span>{a.centre_name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-snug">
                    {a.course_title}: Claimed {a.reported_attendance} vs Observed {a.observed_headcount} ({a.discrepancy_percentage}% variance).
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{a.detected_at}</span>
                    <button
                      onClick={() => handleSelectCentre(a.centre_id)}
                      className="text-blue-900 font-bold hover:underline"
                    >
                      Audit Centre →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
