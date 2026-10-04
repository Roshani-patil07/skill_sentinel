import React, { useState } from 'react'
import {
  BarChart2, TrendingUp, TrendingDown, ShieldCheck,
  CheckCircle2, AlertOctagon, Download, Calendar
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { Card } from '../components/ui/Card'
import { MetricCard } from '../components/ui/MetricCard'
import { ChartCard } from '../components/ui/ChartCard'

export const ComplianceAnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'30D' | '90D' | '1Y'>('30D')

  // Attendance Curve data
  const attendanceTrend = [
    { date: 'Sep 05', reported: 88, observed: 85 },
    { date: 'Sep 12', reported: 90, observed: 86 },
    { date: 'Sep 19', reported: 91, observed: 84 },
    { date: 'Sep 26', reported: 92, observed: 79 },
    { date: 'Oct 03', reported: 92, observed: 74 },
  ]

  // State Compliance Ranking
  const stateRankings = [
    { state: 'Tamil Nadu', compliance: 96.2, deficitRate: 3.1 },
    { state: 'Gujarat', compliance: 94.8, deficitRate: 4.2 },
    { state: 'Karnataka', compliance: 92.4, deficitRate: 6.0 },
    { state: 'Maharashtra', compliance: 88.5, deficitRate: 9.8 },
    { state: 'Delhi NCT', compliance: 83.2, deficitRate: 14.5 },
    { state: 'Uttar Pradesh', compliance: 79.1, deficitRate: 18.2 },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Macro Longitudinal Intelligence
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Cross-Cutting Compliance Analytics
          </h1>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-mono font-semibold">
          {(['30D', '90D', '1Y'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded transition-colors ${
                timeframe === t ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <MetricCard
          label="Attendance Compliance"
          value="89.4%"
          delta={{ value: '-2.1%', isPositive: false }}
          subtext="Net physical attendance ratio"
          variant="warning"
        />
        <MetricCard
          label="Infrastructure Rate"
          value="93.8%"
          delta={{ value: '+1.4%', isPositive: true }}
          subtext="Lab equipment presence"
          variant="healthy"
        />
        <MetricCard
          label="Intervention Speed"
          value="4.2h"
          delta={{ value: '-1.8h', isPositive: true }}
          subtext="Average resolution turnaround"
          variant="navy"
        />
        <MetricCard
          label="Subsidy Safeguarded"
          value="₹4.82 Cr"
          subtext="Retained via preventive audits"
          variant="healthy"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance Divergence Curve */}
        <ChartCard
          title="National Attendance Divergence Curve"
          subtitle="Reported Biometric Claims (%) vs AI Camera Headcount (%)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attendanceTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[60, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="reported"
                stroke="#64748b"
                strokeWidth={2}
                name="Reported Portal Claims (%)"
              />
              <Line
                type="monotone"
                dataKey="observed"
                stroke="#1e3a8a"
                strokeWidth={2.5}
                name="AI Observed Presence (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* State Rankings Bar Chart */}
        <ChartCard
          title="State Compliance Index Rankings"
          subtitle="Overall composite compliance score across monitored jurisdictions"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stateRankings}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
              <YAxis dataKey="state" type="category" stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="compliance" fill="#1e3a8a" radius={[0, 4, 4, 0]} name="Compliance Score" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
