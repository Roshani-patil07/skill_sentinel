import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Building2, MapPin, Video, Eye, HardDrive, ShieldAlert,
  Calendar, Clock, CheckCircle2, AlertOctagon, Send,
  ArrowLeft, FileText, Camera, RefreshCw, HelpCircle
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { Card } from '../components/ui/Card'
import { RiskBadge } from '../components/ui/RiskBadge'
import { StatusBadge } from '../components/ui/StatusBadge'
import { MetricCard } from '../components/ui/MetricCard'
import { Timeline, TimelineItem } from '../components/ui/Timeline'
import { LoadingState } from '../components/ui/LoadingState'
import { ErrorState } from '../components/ui/ErrorState'
import { useSentinelStore } from '../store/useSentinelStore'
import { MOCK_CENTRES } from '../data/mockData'

export const CentreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { openExplainer, openInterventionModal } = useSentinelStore()

  const [centre, setCentre] = useState<any>(null)
  const [riskExplain, setRiskExplain] = useState<any>(null)
  const [temporalHistory, setTemporalHistory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'RISK' | 'ATTENDANCE' | 'INFRASTRUCTURE' | 'TIMELINE'>('RISK')

  const centreId = id || 'tc-del-042'

  const fetchDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const [centreRes, explainRes, tempRes] = await Promise.all([
        fetch(`/api/v1/centres/${centreId}`),
        fetch(`/api/v1/risk/centres/${centreId}/explain`),
        fetch(`/api/v1/risk/history?centre_id=${centreId}`),
      ])

      if (!centreRes.ok) throw new Error('Centre record not found')

      const centreData = await centreRes.json()
      const explainData = await explainRes.json()
      const tempData = await tempRes.json()

      setCentre(centreData)
      setRiskExplain(explainData)
      setTemporalHistory(tempData)
    } catch (err: any) {
      console.warn('Backend unavailable, using mock centre dossier:', err)
      const found = MOCK_CENTRES.find((c) => c.id === centreId) || MOCK_CENTRES[0]
      setCentre({
        ...found,
        contact_email: `${found.centre_code.toLowerCase()}@skillsentinel.gov.in`,
        contact_phone: '+91 20 2712 8890',
        cameras: [
          { id: 'cam-01', name: 'CAM-01: Practical Machining Bay', room_type: 'PRACTICAL_LAB', status: 'ONLINE', stream_url: 'rtsp://edge-01:8554/live' },
          { id: 'cam-02', name: 'CAM-02: CAD / IT Simulation Classroom', room_type: 'COMPUTER_LAB', status: 'ONLINE', stream_url: 'rtsp://edge-02:8554/live' },
          { id: 'cam-03', name: 'CAM-03: Solar PV Practical Yard', room_type: 'OUTDOOR_LAB', status: 'ONLINE', stream_url: 'rtsp://edge-03:8554/live' },
        ],
        batches: [
          { id: 'b-1', batch_code: 'B-PUN-CNC-04', sanctioned_strength: 30, scheduled_start: '09:00', scheduled_end: '13:00', classroom: 'Bay 1' },
          { id: 'b-2', batch_code: 'B-PUN-CAD-02', sanctioned_strength: 25, scheduled_start: '14:00', scheduled_end: '18:00', classroom: 'CAD Lab 204' },
        ],
      })
      setRiskExplain({
        composite_risk_score: found.current_risk_score,
        risk_level: found.current_risk_level,
        factors: [
          { name: 'Attendance Discrepancy', contribution: 45, raw_value: '-71.4% variance', severity: 'CRITICAL' },
          { name: 'Sanctioned Asset Deficit', contribution: 25, raw_value: '1 CNC Machine unverified', severity: 'HIGH' },
          { name: 'Temporal Recurrence', contribution: 15, raw_value: '3 consecutive flagged days', severity: 'CRITICAL' },
          { name: 'Infrastructure Health', contribution: 10, raw_value: 'Camera uptime 99.2%', severity: 'LOW' },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [centreId])

  if (loading) {
    return <LoadingState message="Retrieving centre compliance dossier..." />
  }

  if (error || !centre) {
    return <ErrorState message={error || 'Centre not found'} onRetry={fetchDetail} />
  }

  // Trajectory data for Recharts
  const trajectoryData =
    temporalHistory?.recent_daily_history?.map((d: any) => ({
      day: d.day_name.slice(0, 3),
      headcount: d.average_headcount,
      status: d.status,
    })) || [
      { day: 'Mon', headcount: 28, status: 'COMPLIANT' },
      { day: 'Tue', headcount: 27, status: 'COMPLIANT' },
      { day: 'Wed', headcount: 12, status: 'FLAGGED' },
      { day: 'Thu', headcount: 10, status: 'FLAGGED' },
      { day: 'Fri', headcount: 8, status: 'FLAGGED' },
    ]

  // Timeline items
  const timelineItems: TimelineItem[] = [
    {
      id: 't-1',
      title: 'Potential attendance discrepancy identified',
      timestamp: 'Today, 10:15 AM',
      description: 'Vision headcount detected 8 trainees vs 28 reported on portal (-71.4% variance).',
      badge: <StatusBadge status="CRITICAL" />,
      actor: 'YOLO-Edge Analyzer CAM-01',
    },
    {
      id: 't-2',
      title: 'Lab asset deficit flagged',
      timestamp: 'Yesterday, 04:30 PM',
      description: 'Physical scan noted 4 sanctioned workstations absent from IoT practical room.',
      badge: <StatusBadge status="WARNING" />,
      actor: 'Infrastructure Verifier',
    },
    {
      id: 't-3',
      title: 'Routine biometric portal submission',
      timestamp: '3 days ago, 09:00 AM',
      description: 'Morning IoT Batch attendance submitted with 28 trainees claimed.',
      badge: <StatusBadge status="COMPLIANT" />,
      actor: 'Centre Coordinator',
    },
  ]

  return (
    <div className="space-y-5">
      {/* Back button and Profile Header */}
      <div>
        <button
          onClick={() => navigate('/centres')}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Centres</span>
        </button>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{centre.name}</h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                {centre.centre_code}
              </span>
              <RiskBadge score={centre.current_risk_score} level={centre.current_risk_level} />
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{centre.address}</span>
              <span>•</span>
              <span>District: {centre.district}, {centre.state}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => openExplainer(centre.id)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-blue-900" />
              <span>Risk Explainer</span>
            </button>
            <button
              onClick={() => openInterventionModal(centre.id)}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Trigger Intervention</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 gap-1 bg-white px-3 rounded-lg border shadow-xs overflow-x-auto">
        {[
          { key: 'RISK', label: 'Risk Intelligence & Trajectory', icon: ShieldAlert },
          { key: 'ATTENDANCE', label: 'Attendance & Headcount', icon: Eye },
          { key: 'INFRASTRUCTURE', label: 'Infrastructure & Cameras', icon: HardDrive },
          { key: 'TIMELINE', label: 'Evidence & Audit Timeline', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-900 text-blue-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-900' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Risk Intelligence & Trajectory */}
      {activeTab === 'RISK' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <Card
              title="7-Day Trajectory: Observed Physical Headcount vs Portal Claims"
              subtitle="Daily presence patterns across consecutive sessions"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trajectoryData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 35]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="headcount"
                      stroke="#1e3a8a"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#1e3a8a' }}
                      name="Observed Headcount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Sanctioned Batch Capacity: 30 Students</span>
                <span className="font-mono text-rose-600 font-semibold">
                  Trajectory: {temporalHistory?.weekly_trajectory || 'DEGRADING'}
                </span>
              </div>
            </Card>

            {/* Why is this centre risky? */}
            <Card title="Why is this centre risky?" subtitle="Top driving factors with exact point contributions">
              <div className="space-y-3">
                {riskExplain?.factors?.map((f: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{f.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">Weight: {Math.round(f.weight * 100)}%</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      +{f.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card title="Recommended Regulatory Action">
              <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed font-medium">
                {riskExplain?.recommended_intervention || 'Issue Automated Show-Cause Notice & Schedule Mandatory Physical Audit.'}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => openInterventionModal(centre.id)}
                  className="w-full py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs transition-colors"
                >
                  Dispatch Surprise Physical Inspection
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance & Headcount */}
      {activeTab === 'ATTENDANCE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <MetricCard
            label="Portal Reported Attendance"
            value="28 Students"
            subtext="Claimed for Morning IoT Batch"
            icon={<CheckCircle2 className="w-4 h-4 text-slate-700" />}
          />
          <MetricCard
            label="Camera Observed Presence"
            value="8 Trainees"
            subtext="YOLO Aggregate Headcount CAM-01"
            icon={<Eye className="w-4 h-4 text-emerald-700" />}
            variant="warning"
          />
          <MetricCard
            label="Attendance Discrepancy"
            value="-71.4%"
            subtext="20 fewer trainees physically present"
            icon={<AlertOctagon className="w-4 h-4 text-rose-700" />}
            variant="critical"
          />
        </div>
      )}

      {/* Tab 3: Infrastructure & Cameras */}
      {activeTab === 'INFRASTRUCTURE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card title="Sanctioned Equipment Inventory" subtitle="Required vs physical verified count">
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <span>Computer Workstations (IoT)</span>
                <span className="font-bold text-slate-900">18 / 20 Verified</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <span>CNC Machine Trainers</span>
                <span className="font-bold text-emerald-700">4 / 4 Verified</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <span>Welding Simulators</span>
                <span className="font-bold text-rose-700">1 / 2 (1 Missing)</span>
              </div>
            </div>
          </Card>

          <Card title="CCTV Camera Devices" subtitle="Live RTSP camera endpoints">
            <div className="space-y-2">
              {centre.cameras?.map((cam: any) => (
                <div key={cam.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{cam.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{cam.room_type}</span>
                  </div>
                  <StatusBadge status={cam.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Evidence & Audit Timeline */}
      {activeTab === 'TIMELINE' && (
        <Card title="Longitudinal Compliance & Audit Timeline" subtitle="Recorded events, inspections, and interventions">
          <Timeline items={timelineItems} />
        </Card>
      )}
    </div>
  )
}
