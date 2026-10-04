import React, { useEffect, useState } from 'react'
import {
  Video, Eye, AlertOctagon, UserX, UserCheck, ShieldCheck,
  Radio, Clock, Cpu, RefreshCw, HelpCircle, Send,
  Activity, Layers, Calendar, Sliders, CheckCircle2,
  HardDrive, QrCode, Wifi, ArrowUpRight, TrendingUp, BarChart3
} from 'lucide-react'
import { useSentinelStore } from '../store/useSentinelStore'

interface CentreDetail {
  id: string
  centre_code: string
  name: string
  address: string
  district: string
  state: string
  contact_email: string
  contact_phone: string
  current_risk_score: number
  current_risk_level: string
  cameras: { id: string; name: string; room_type: string; status: string; stream_url: string }[]
  batches: { id: string; batch_code: string; sanctioned_strength: number; scheduled_start: string; scheduled_end: string; classroom: string }[]
  total_assets: number
  verified_assets: number
  missing_assets: number
}

export const CentreLiveMonitor: React.FC = () => {
  const { selectedCentreId, openExplainer, openInterventionModal, liveEvents } = useSentinelStore()
  const [centre, setCentre] = useState<CentreDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // Live telemetry metrics (can be updated via WebSockets or simulation)
  const [liveHeadcount, setLiveHeadcount] = useState(8)
  const [edgeMode, setEdgeMode] = useState<'LOCAL' | 'EDGE' | 'SERVER'>('EDGE')
  const [privacyBlurActive, setPrivacyBlurActive] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState<'ACTIVITY' | 'INFRASTRUCTURE' | 'TEMPORAL' | 'RISK_FACTORS'>('ACTIVITY')

  // Activity signals state
  const [motionEnergy, setMotionEnergy] = useState(0.42)
  const [stationaryCount, setStationaryCount] = useState(6)
  const [movingCount, setMovingCount] = useState(2)
  const [engagementScore, setEngagementScore] = useState(78.5)

  // Temporal intelligence state
  const [consecutiveAnomalyDays, setConsecutiveAnomalyDays] = useState(0)
  const [repeatMultiplier, setRepeatMultiplier] = useState(1.0)

  const reportedBiometric = 28
  const sanctionedStrength = 30

  const fetchCentre = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/centres/${selectedCentreId}`)
      const data = await res.json()
      setCentre(data)
    } catch (err) {
      console.error('Failed to load centre detail:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCentre()
  }, [selectedCentreId])

  // Listen to live events for headcount and scenario changes
  useEffect(() => {
    if (!liveEvents || liveEvents.length === 0) return
    const latestEvent = liveEvents[0]
    if (!latestEvent || !latestEvent.payload) return

    const payload = latestEvent.payload
    if (payload.headcount !== undefined) {
      setLiveHeadcount(payload.headcount)
    } else if (payload.observed !== undefined) {
      setLiveHeadcount(payload.observed)
    }

    if (payload.activity_score !== undefined) {
      setEngagementScore(Math.round(payload.activity_score * 100))
      setMotionEnergy(payload.activity_score)
      if (payload.stationary_count !== undefined) setStationaryCount(payload.stationary_count)
      if (payload.moving_count !== undefined) setMovingCount(payload.moving_count)
    }

    if (payload.consecutive_days !== undefined) {
      setConsecutiveAnomalyDays(payload.consecutive_days)
      if (payload.multiplier) setRepeatMultiplier(payload.multiplier)
    }
  }, [liveEvents])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  const discrepancy = liveHeadcount - reportedBiometric
  const discrepancyPct = Math.round((discrepancy / reportedBiometric) * 100)
  const isSevere = discrepancyPct < -40

  return (
    <div className="space-y-6">
      {/* Centre Header Bar */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold text-white">{centre?.name}</span>
            <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-xs border border-gray-700">
              {centre?.centre_code}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                centre?.current_risk_level === 'CRITICAL'
                  ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              RISK: {centre?.current_risk_score} / 100 ({centre?.current_risk_level})
            </span>
            {repeatMultiplier > 1.0 && (
              <span className="px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-700 text-xs font-mono font-bold">
                REPEAT FACTOR: {repeatMultiplier}x ({consecutiveAnomalyDays} consecutive days)
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {centre?.address} • District: {centre?.district}, {centre?.state}
          </p>
        </div>

        {/* Action Controls & Edge Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Edge Mode Selector */}
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg p-0.5 text-xs font-mono">
            {(['LOCAL', 'EDGE', 'SERVER'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setEdgeMode(m)}
                className={`px-2 py-1 rounded transition-all ${
                  edgeMode === m ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => openExplainer(centre!.id)}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Explainable AI Factors
          </button>
          <button
            onClick={() => openInterventionModal(centre!.id)}
            className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-200 text-xs font-semibold border border-red-800 flex items-center gap-1.5 shadow-glow-red transition-colors"
          >
            <Send className="w-4 h-4 text-red-400" />
            Preventive Intervention
          </button>
        </div>
      </div>

      {/* Main Real-Time Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Camera View with YOLO Detection & Tracking */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold text-gray-200 uppercase font-mono tracking-wider">
                LIVE RTSP STREAM • CAM-01 [IoT Lab 101]
              </span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                Edge Transmit: 1.4 KB/pkt
              </span>
              <span className="text-gray-500">|</span>
              <span>1080p @ 15 FPS • 34ms</span>
            </div>
          </div>

          {/* Video Player Canvas / Visualizer with Anonymized Bounding Boxes */}
          <div className="relative w-full aspect-video bg-gradient-to-b from-gray-950 to-slate-950 rounded-lg border border-gray-800 overflow-hidden flex items-center justify-center">
            {/* Grid overlay simulating lab floor zones */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Spatial Zone Overlay Labels */}
            <div className="absolute top-12 left-4 text-[9px] font-mono text-cyan-400/60 border border-cyan-800/40 bg-cyan-950/20 px-2 py-0.5 rounded">
              ZONE: WORKSTATIONS (DESKS 1-12)
            </div>
            <div className="absolute top-12 right-4 text-[9px] font-mono text-indigo-400/60 border border-indigo-800/40 bg-indigo-950/20 px-2 py-0.5 rounded">
              ZONE: INSTRUCTOR PODIUM
            </div>

            {/* Privacy Watermark */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-emerald-400 font-mono border border-emerald-500/30 flex items-center gap-1.5 z-10">
              <ShieldCheck className="w-3.5 h-3.5" />
              PRIVACY COMPLIANT: NON-BIOMETRIC TRACKING ONLY
            </div>

            {/* Live Headcount Overlay Tag */}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white border border-gray-700 flex items-center gap-2 z-10">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>HEADCOUNT:</span>
              <span className="text-emerald-400 text-sm">{liveHeadcount} PERSONS</span>
            </div>

            {/* Simulated Anonymized Bounding Boxes corresponding to liveHeadcount */}
            <div className="relative w-full h-full p-4 pointer-events-none">
              {Array.from({ length: Math.min(liveHeadcount, 12) }).map((_, idx) => {
                const col = idx % 4
                const row = Math.floor(idx / 4)
                const left = 12 + col * 22
                const top = 24 + row * 24

                return (
                  <div
                    key={idx}
                    className="absolute border-2 border-emerald-400/90 rounded bg-emerald-500/10 transition-all duration-500 flex flex-col justify-between p-1"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: '12%',
                      height: '24%',
                      filter: privacyBlurActive ? 'none' : 'none'
                    }}
                  >
                    <div className="flex items-center justify-between text-[8px] font-mono text-emerald-300 bg-emerald-950/90 px-1 rounded">
                      <span>T#{idx + 101}</span>
                      <span>94%</span>
                    </div>
                    <div className="text-[7px] font-mono text-emerald-300/80 text-center">
                      [Class: Person]
                    </div>
                    <div className="text-[7px] font-mono text-cyan-300/80 text-right">
                      v: 0.12 m/s
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Stream Status Line */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-gray-400 bg-black/70 px-3 py-1 rounded border border-gray-800">
              <span>YOLOv11-Edge [Person, Computer, Machine, Tool]</span>
              <span>Spatial Centroid Tracker active</span>
              <span className="text-emerald-400">FPS: 15.2 • Loss: 0%</span>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              Room: IoT Lab 101 • Capacity: 30 Workstations
            </span>
            <span className="text-emerald-400 font-mono">Edge Pipeline Heartbeat: 2s ago</span>
          </div>
        </div>

        {/* Right Panel: Attendance Integrity Analysis */}
        <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                Attendance Integrity Matrix
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">Live Comparison</span>
            </div>

            {/* Discrepancy Breakdown */}
            <div className="space-y-3.5 mt-4">
              <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-gray-400">Portal Claimed Attendance</div>
                  <div className="text-xl font-bold text-gray-200 font-mono">{reportedBiometric} Trainees</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-gray-400">Batch Capacity</div>
                  <div className="text-sm font-semibold text-gray-400 font-mono">{sanctionedStrength} Seats</div>
                </div>
              </div>

              <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-gray-400">Camera Vision Headcount</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">{liveHeadcount} Detected</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-gray-400">Detection Confidence</div>
                  <div className="text-sm font-semibold text-emerald-400 font-mono">92.4% avg</div>
                </div>
              </div>

              {/* Net Discrepancy Alert Card */}
              <div
                className={`p-3.5 rounded-lg border transition-all ${
                  isSevere
                    ? 'bg-red-950/60 border-red-800 shadow-glow-red'
                    : 'bg-emerald-950/40 border-emerald-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Discrepancy Delta
                  </span>
                  <span
                    className={`text-sm font-mono font-extrabold ${
                      isSevere ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                    }`}
                  >
                    {discrepancy} Persons ({discrepancyPct}%)
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 leading-snug">
                  {isSevere
                    ? 'POTENTIAL ATTENDANCE DISCREPANCY: Observed physical presence is significantly below portal reported attendance. Non-judgmental verification protocol initiated.'
                    : 'COMPLIANT: Physical headcount corresponds with portal records within acceptable temporal tolerance.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action guidance */}
          <div className="p-3 bg-gray-900/70 rounded-lg border border-gray-800 text-xs text-gray-300">
            <span className="text-amber-400 font-bold">Recommended Action: </span>
            {isSevere
              ? 'Issue automated WhatsApp alert to District Officer and dispatch an unannounced QR audit.'
              : 'Routine continuous monitoring. No physical intervention required.'}
          </div>
        </div>
      </div>

      {/* AI Intelligence Layer Deep Dive Navigation */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">AI Intelligence & Compliance Engine</h3>
          </div>
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveSubTab('ACTIVITY')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'ACTIVITY' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Activity Signals
            </button>
            <button
              onClick={() => setActiveSubTab('INFRASTRUCTURE')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'INFRASTRUCTURE' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              Infrastructure
            </button>
            <button
              onClick={() => setActiveSubTab('TEMPORAL')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'TEMPORAL' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Temporal Intelligence
            </button>
            <button
              onClick={() => setActiveSubTab('RISK_FACTORS')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSubTab === 'RISK_FACTORS' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Risk Formula (6-Pillars)
            </button>
          </div>
        </div>

        {/* Tab 1: Activity Signals & Kinematics */}
        {activeSubTab === 'ACTIVITY' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">Engagement Index</div>
              <div className="text-2xl font-bold font-mono text-cyan-400">{engagementScore}%</div>
              <div className="w-full bg-gray-800 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all"
                  style={{ width: `${engagementScore}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">Classroom kinetic motion dynamic</div>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">Kinetic Motion Energy</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{motionEnergy.toFixed(2)}</div>
              <div className="text-[11px] text-gray-400 mt-2">
                Velocity: 0.18 m/s avg | Optical Flow stable
              </div>
              <div className="text-[10px] text-gray-500 mt-1">Tracks student activity vs idle states</div>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">Stationary vs Moving</div>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {stationaryCount} : {movingCount}
              </div>
              <div className="text-[11px] text-gray-400 mt-2">
                {Math.round((stationaryCount / (stationaryCount + movingCount || 1)) * 100)}% seated at desks
              </div>
              <div className="text-[10px] text-gray-500 mt-1">Normal practical training distribution</div>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">Zone Distribution</div>
              <div className="space-y-1 text-xs font-mono mt-1">
                <div className="flex justify-between text-gray-300">
                  <span>Workstations:</span> <span className="text-emerald-400">8 persons</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Instructor Podium:</span> <span className="text-cyan-400">1 person</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Entrance / Exit:</span> <span className="text-gray-400">0 persons</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Infrastructure Compliance & QR Verification */}
        {activeSubTab === 'INFRASTRUCTURE' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-bold uppercase">Required vs Detected</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-800">
                  Presence: 92.3%
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center bg-gray-950/60 p-2 rounded">
                  <span className="text-gray-300">Computers (IoT Dev):</span>
                  <span className="text-emerald-400">18 / 20 Present</span>
                </div>
                <div className="flex justify-between items-center bg-gray-950/60 p-2 rounded">
                  <span className="text-gray-300">CNC Trainers:</span>
                  <span className="text-emerald-400">4 / 4 Present</span>
                </div>
                <div className="flex justify-between items-center bg-gray-950/60 p-2 rounded">
                  <span className="text-gray-300">Welding Simulators:</span>
                  <span className="text-amber-400">1 / 2 Present (-1)</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase mb-2">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  Dual QR + Vision Cross-Check
                </div>
                <div className="text-xs text-gray-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Registered in National Asset Registry</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Assigned to this Geo-Fenced Centre</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Maintenance Schedule Compliant (Next: Nov 2026)</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-2 rounded bg-cyan-950/40 border border-cyan-800 text-[10px] text-cyan-300 font-mono">
                VISION VERIFICATION: Object detected in active classroom frame matches registered QR specification.
              </div>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase mb-1 block">Infrastructure Score</span>
                <div className="text-3xl font-bold font-mono text-emerald-400">92 / 100</div>
                <p className="text-xs text-gray-400 mt-2">
                  1 missing welding simulator flagged for verification with centre supervisor.
                </p>
              </div>
              <div className="text-[10px] text-gray-500 font-mono mt-3">
                Auto-audited via daily YOLO asset bounding boxes.
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Temporal Intelligence (5m to 30d sliding windows) */}
        {activeSubTab === 'TEMPORAL' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { label: '5 Mins', status: 'STABLE', val: '8 Trainees' },
                { label: '15 Mins', status: 'STABLE', val: '9 Trainees' },
                { label: '1 Hour', status: 'COMPLIANT', val: '8.4 Avg' },
                { label: '1 Day', status: isSevere ? 'DEFICIT' : 'COMPLIANT', val: `${liveHeadcount} Observed` },
                { label: '7 Days', status: repeatMultiplier > 1 ? 'REPEAT MISMATCH' : 'NORMAL', val: `${consecutiveAnomalyDays} Flags` },
                { label: '30 Days', status: 'MONITORED', val: '88% Score' }
              ].map((w, idx) => (
                <div key={idx} className="bg-gray-900/80 p-3 rounded-lg border border-gray-800 text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-mono">{w.label}</div>
                  <div className="text-sm font-bold font-mono text-white mt-1">{w.val}</div>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono mt-1 ${
                      w.status.includes('DEFICIT') || w.status.includes('MISMATCH')
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800 text-xs text-gray-300">
              <span className="font-bold text-purple-400">Longitudinal Pattern Intelligence: </span>
              {repeatMultiplier > 1.0 ? (
                <span className="text-orange-300">
                  Repeated compliance deviation detected across {consecutiveAnomalyDays} consecutive sessions. Risk calculation applied a compounding penalty multiplier of {repeatMultiplier}x.
                </span>
              ) : (
                <span className="text-gray-400">
                  No chronic or repeated multi-day deviation detected. Centre displays stable compliance patterns over the past 7 days.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Configurable Multi-Pillar Risk Formula */}
        {activeSubTab === 'RISK_FACTORS' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
              <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-800">
                <div className="text-gray-400">1. Attendance (30%)</div>
                <div className="text-base font-bold font-mono text-rose-400 mt-1">
                  {isSevere ? '+28 pts' : '+4 pts'}
                </div>
              </div>
              <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-800">
                <div className="text-gray-400">2. Infrastructure (25%)</div>
                <div className="text-base font-bold font-mono text-amber-400 mt-1">+14 pts</div>
              </div>
              <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-800">
                <div className="text-gray-400">3. Activity (15%)</div>
                <div className="text-base font-bold font-mono text-cyan-400 mt-1">
                  {engagementScore < 20 ? '+12 pts' : '+2 pts'}
                </div>
              </div>
              <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-800">
                <div className="text-gray-400">4. Historical (15%)</div>
                <div className="text-base font-bold font-mono text-purple-400 mt-1">
                  {repeatMultiplier > 1 ? '+18 pts' : '+5 pts'}
                </div>
              </div>
              <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-800">
                <div className="text-gray-400">5. Camera Health (10%)</div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-1">+1 pt</div>
              </div>
              <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-800">
                <div className="text-gray-400">6. Inspection (5%)</div>
                <div className="text-base font-bold font-mono text-gray-300 mt-1">+2 pts</div>
              </div>
            </div>

            <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 text-xs font-mono text-gray-300 flex items-center justify-between">
              <span>Formula: 0.30 Attendance + 0.25 Infrastructure + 0.15 Activity + 0.15 Historical + 0.10 Camera + 0.05 Inspection</span>
              <span className="text-cyan-400 font-bold">Weights Configurable via /risk/calculate</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

