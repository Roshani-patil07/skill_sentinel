import React, { useEffect, useState } from 'react'
import {
  Building2, CheckCircle2, AlertTriangle, AlertOctagon,
  ShieldCheck, HardDrive, Bell, Send, ArrowRight,
  TrendingUp, TrendingDown, Eye
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { MetricCard } from '../components/ui/MetricCard'
import { RiskBadge } from '../components/ui/RiskBadge'
import { StatusBadge } from '../components/ui/StatusBadge'
import { AlertCard } from '../components/ui/AlertCard'
import { IndiaRiskMap } from '../components/ui/IndiaRiskMap'
import { LoadingState } from '../components/ui/LoadingState'
import { ErrorState } from '../components/ui/ErrorState'
import { useSentinelStore } from '../store/useSentinelStore'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { centres, setCentres, setSelectedCentreId, openInterventionModal } = useSentinelStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [radar, setRadar] = useState<any>(null)
  const [anomalies, setAnomalies] = useState<any[]>([])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [centresRes, radarRes, anomaliesRes] = await Promise.all([
        fetch('/api/v1/centres'),
        fetch('/api/v1/risk/radar'),
        fetch('/api/v1/vision/anomalies'),
      ])

      const centresData = await centresRes.json()
      const radarData = await radarRes.json()
      const anomaliesData = await anomaliesRes.json()

      if (Array.isArray(centresData)) setCentres(centresData)
      setRadar(radarData)
      if (Array.isArray(anomaliesData)) setAnomalies(anomaliesData)
    } catch (err: any) {
      console.error(err)
      setError('Could not establish synchronization with central command registry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading && centres.length === 0) {
    return <LoadingState message="Loading National Early-Warning Command Grid..." />
  }

  if (error && centres.length === 0) {
    return <ErrorState message={error} onRetry={loadData} />
  }

  // Calculate high-level compliance metrics
  const total = centres.length || 5
  const healthy = centres.filter((c) => (c.current_risk_score || 0) < 40).length
  const watchlist = centres.filter((c) => (c.current_risk_score || 0) >= 40 && (c.current_risk_score || 0) < 70).length
  const highRisk = centres.filter((c) => (c.current_risk_score || 0) >= 70 && (c.current_risk_score || 0) < 85).length
  const critical = centres.filter((c) => (c.current_risk_score || 0) >= 85).length

  const avgRisk = centres.reduce((acc, c) => acc + (c.current_risk_score || 0), 0) / (total || 1)
  const nationalCompliance = Math.max(0, Math.round(100 - avgRisk))

  // Map centres for IndiaRiskMap
  const geoCentres = centres.map((c) => ({
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
            National Dashboard • Real-Time Early-Warning Grid
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            National Compliance & Early-Warning Command
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/live')}
            className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Live Feeds</span>
          </button>
        </div>
      </div>

      {/* Row 1: Primary Centre Status Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <MetricCard
          label="Total Centres"
          value={total}
          icon={<Building2 className="w-4 h-4 text-slate-700" />}
          subtext="Centres actively transmitting"
          variant="navy"
          onClick={() => navigate('/centres')}
        />
        <MetricCard
          label="Healthy Centres"
          value={healthy}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          subtext="Risk Score < 40"
          variant="healthy"
        />
        <MetricCard
          label="Watchlist"
          value={watchlist}
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          subtext="Risk Score 40 – 69"
          variant="warning"
        />
        <MetricCard
          label="High Risk"
          value={highRisk}
          icon={<AlertOctagon className="w-4 h-4 text-orange-600" />}
          subtext="Risk Score 70 – 84"
          variant="critical"
        />
        <MetricCard
          label="Critical Risk"
          value={critical}
          icon={<AlertOctagon className="w-4 h-4 text-rose-600" />}
          subtext="Immediate Intervention Needed"
          variant="critical"
        />
      </div>

      {/* Row 2: Secondary Performance & Integrity Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          label="National Compliance Score"
          value={`${nationalCompliance}%`}
          delta={{ value: '+2.4%', isPositive: true }}
          subtext="Composite across attendance & assets"
          icon={<ShieldCheck className="w-4 h-4 text-blue-800" />}
        />
        <MetricCard
          label="Attendance Integrity"
          value="91.2%"
          delta={{ value: '-1.1%', isPositive: false }}
          subtext="Portal claim vs vision presence"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />}
        />
        <MetricCard
          label="Infrastructure Compliance"
          value="89.5%"
          delta={{ value: '+0.8%', isPositive: true }}
          subtext="Mandatory lab assets verified"
          icon={<HardDrive className="w-4 h-4 text-blue-800" />}
        />
        <MetricCard
          label="Pending Interventions"
          value="3"
          subtext="Requires officer acknowledgement"
          icon={<Send className="w-4 h-4 text-rose-700" />}
          onClick={() => navigate('/interventions')}
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
                (India → State → District → Centre)
              </span>
            </h3>
          </div>

          <IndiaRiskMap centres={geoCentres} onSelectCentre={handleSelectCentre} />
        </div>

        {/* Right: Urgent At-Risk Centres Watchlist & Live Telemetry Feed */}
        <div className="space-y-4 flex flex-col justify-between">
          <Card
            title="High-Risk Watchlist"
            subtitle="Centres exceeding intervention thresholds"
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
              {centres
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
                      <span className="font-mono text-slate-400">{c.centre_code}</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Recent Anomaly Alerts Card */}
          <Card
            title="Active Intelligence Alerts"
            subtitle="Automated anomaly detections"
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
                <AlertCard
                  key={a.id}
                  severity={a.severity}
                  title={a.type.replace(/_/g, ' ')}
                  centreName={a.centre_name}
                  centreCode={a.centre_code}
                  description={a.explanation}
                  timestamp={a.timestamp}
                  onActionClick={() => handleSelectCentre(a.centre_id)}
                  actionLabel="Inspect"
                />
              ))}
              {anomalies.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400">
                  Zero active anomalies. All centres compliant.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
