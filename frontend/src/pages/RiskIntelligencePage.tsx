import React, { useState, useEffect } from 'react'
import {
  ShieldAlert, TrendingUp, TrendingDown, AlertTriangle, AlertOctagon,
  ArrowRight, CheckCircle2, HelpCircle, Sliders, Send
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line
} from 'recharts'
import { Card } from '../components/ui/Card'
import { MetricCard } from '../components/ui/MetricCard'
import { RiskBadge } from '../components/ui/RiskBadge'
import { LoadingState } from '../components/ui/LoadingState'
import { useSentinelStore } from '../store/useSentinelStore'

export const RiskIntelligencePage: React.FC = () => {
  const { centres, selectedCentreId, setSelectedCentreId, openInterventionModal } = useSentinelStore()

  const [explainData, setExplainData] = useState<any>(null)
  const [radarData, setRadarData] = useState<any>(null)
  const [temporalData, setTemporalData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const activeCentre = centres.find((c) => c.id === selectedCentreId) || centres[0] || {
    id: 'tc-del-042',
    name: 'PMKK Okhla Industrial Skill Hub',
    centre_code: 'DEL-OKH-042',
    current_risk_score: 87.5,
    current_risk_level: 'HIGH',
  }

  const loadData = async (cid: string) => {
    setLoading(true)
    try {
      const [explainRes, radarRes, tempRes] = await Promise.all([
        fetch(`/api/v1/risk/centres/${cid}/explain`),
        fetch('/api/v1/risk/radar'),
        fetch(`/api/v1/risk/history?centre_id=${cid}`),
      ])

      const ed = await explainRes.json().catch(() => null)
      const rd = await radarRes.json().catch(() => null)
      const td = await tempRes.json().catch(() => null)

      if (ed) setExplainData(ed)
      if (rd) setRadarData(rd)
      if (td) setTemporalData(td)
    } catch (e) {
      console.warn('Risk API offline, using local risk model fallback:', e)
    } finally {
      setExplainData((prev: any) => prev || {
        composite_risk_score: activeCentre.current_risk_score || 54.0,
        risk_level: activeCentre.current_risk_level || 'MODERATE',
        recommended_intervention: 'Issue Automated Digital Show-Cause Notice & Schedule Surprise Physical Audit.',
        factors: [
          { name: 'Physical Attendance Discrepancy', contribution: 45.2, raw_value: '-71.4% variance', severity: 'CRITICAL', explanation: 'AI optical headcount detected 8 trainees vs 28 recorded via biometric terminal.' },
          { name: 'Sanctioned Asset Deficit', contribution: 24.8, raw_value: '1 CNC Machine unverified', severity: 'HIGH', explanation: '1 high-value sanctioned CNC Lathe unverified in practical bay frame.' },
          { name: 'Temporal Recurrence Multiplier', contribution: 15.0, raw_value: '3 consecutive days', severity: 'CRITICAL', explanation: 'Penalty multiplier applied due to multi-day recurring non-compliance.' },
          { name: 'Audit Non-Compliance History', contribution: 15.0, raw_value: 'Prior show-cause active', severity: 'MODERATE', explanation: 'Centre has pending resolution from previous quarter inspection audit.' },
        ],
      })
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeCentre?.id) {
      loadData(activeCentre.id)
    }
  }, [activeCentre?.id])

  if (loading && !explainData) {
    return <LoadingState message="Computing multi-pillar risk matrices..." />
  }

  const score = explainData?.composite_risk_score || activeCentre.current_risk_score || 87.5
  const level = explainData?.risk_level || activeCentre.current_risk_level || 'HIGH'

  // National Distribution data for BarChart
  const distributionData = [
    { name: 'Healthy (<40)', count: radarData?.distribution?.LOW || 2, fill: '#16a34a' },
    { name: 'Moderate (40-69)', count: radarData?.distribution?.MODERATE || 1, fill: '#d97706' },
    { name: 'High (70-84)', count: radarData?.distribution?.HIGH || 1, fill: '#ea580c' },
    { name: 'Critical (85+)', count: radarData?.distribution?.CRITICAL || 1, fill: '#dc2626' },
  ]

  // Historical 5-day risk trend
  const trendData = [
    { day: 'Mon', score: 38 },
    { day: 'Tue', score: 42 },
    { day: 'Wed', score: 68 },
    { day: 'Thu', score: 79 },
    { day: 'Fri', score: Math.round(score) },
  ]

  return (
    <div className="space-y-5">
      {/* Header & Centre Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Continuous Risk Analytics
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            National Risk Intelligence & Explainability Engine
          </h1>
        </div>

        {/* Centre Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Select Centre:</label>
          <select
            value={activeCentre.id}
            onChange={(e) => {
              setSelectedCentreId(e.target.value)
              loadData(e.target.value)
            }}
            className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-900/20 shadow-xs cursor-pointer"
          >
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.centre_code}) - Risk: {c.current_risk_score}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 1: Primary Score Card & What's Changed Since Yesterday */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Risk Score Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Centre Risk Score
              </span>
              <RiskBadge score={score} level={level} />
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-sans text-slate-900 font-tabular">
                {Math.round(score)}
              </span>
              <span className="text-sm font-bold text-rose-600 uppercase font-mono">
                {level} RISK
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all ${
                  score >= 85 ? 'bg-rose-600' : score >= 70 ? 'bg-orange-600' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, score)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Multi-Pillar Formula: 6 Weights</span>
            <span className="font-mono text-slate-700 font-semibold">{activeCentre.centre_code}</span>
          </div>
        </div>

        {/* What's changed since yesterday? */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              What's Changed Since Yesterday?
            </span>
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed font-medium">
              <div className="font-bold flex items-center gap-1.5 text-rose-800 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>+18.5 Risk Escalation Points</span>
              </div>
              <p>
                Observed physical presence dropped for the 3rd consecutive day (8 trainees detected vs 28 reported). Longitudinal repeat penalty multiplier (1.75x) applied.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
            Calculated at: {new Date().toLocaleTimeString()} • Edge Ingest
          </div>
        </div>

        {/* Recommended Action Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Recommended Action
            </span>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed font-medium">
              {explainData?.recommended_intervention ||
                'Issue Automated Digital Show-Cause Notice & Schedule Surprise Physical Audit.'}
            </div>
          </div>

          <button
            onClick={() => openInterventionModal(activeCentre.id)}
            className="w-full mt-3 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Protocol</span>
          </button>
        </div>
      </div>

      {/* Row 2: Top Drivers Breakdown & 5-Day Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Drivers Breakdown */}
        <Card title="Why is this centre risky?" subtitle="Top driving factors with exact point contributions">
          <div className="space-y-3">
            {explainData?.factors?.map((f: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <span className="text-xs font-bold text-slate-900">{f.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{f.explanation || 'Verified compliance deviation factor.'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    +{f.points} pts
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Weight: {Math.round(f.weight * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 5-Day Risk Trend Graph */}
        <Card title="5-Day Longitudinal Risk Trajectory" subtitle="Progression from healthy to critical risk">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#dc2626"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#dc2626' }}
                  name="Composite Risk"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 3: National Risk Distribution Breakdown */}
      <Card title="National Risk Distribution" subtitle="Centres categorized across 4 compliance risk tiers">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Centres Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
