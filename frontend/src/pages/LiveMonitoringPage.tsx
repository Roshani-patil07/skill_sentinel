import React, { useState, useEffect } from 'react'
import {
  Video, Eye, Radio, ShieldCheck, Activity, HardDrive,
  AlertOctagon, CheckCircle2, Clock, Wifi, RefreshCw,
  Cpu, Layers, Zap
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { MetricCard } from '../components/ui/MetricCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { AlertCard } from '../components/ui/AlertCard'
import { useSentinelStore } from '../store/useSentinelStore'

export const LiveMonitoringPage: React.FC = () => {
  const { selectedCentreId, isWsConnected, liveEvents } = useSentinelStore()

  const [activeCam, setActiveCam] = useState<'CAM-01' | 'CAM-02' | 'CAM-03'>('CAM-01')
  const [headcount, setHeadcount] = useState(8)
  const [occupancyRate, setOccupancyRate] = useState(27)
  const [activityScore, setActivityScore] = useState(78)
  const [motionEnergy, setMotionEnergy] = useState(0.42)
  const [lastEventTime, setLastEventTime] = useState<string>('Just now')
  const [anomalies, setAnomalies] = useState<any[]>([])

  // Fetch initial occupancy and anomalies
  useEffect(() => {
    fetch(`/api/v1/vision/occupancy?centre_id=${selectedCentreId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.person_count !== undefined) {
          setHeadcount(data.person_count)
          setOccupancyRate(Math.round((data.occupancy_rate || 0.27) * 100))
          setActivityScore(Math.round((data.activity_score || 0.78) * 100))
        }
      })
      .catch((e) => console.error(e))

    fetch(`/api/v1/vision/anomalies?centre_id=${selectedCentreId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAnomalies(data)
      })
      .catch((e) => console.error(e))
  }, [selectedCentreId])

  // Sync with live WebSocket events
  useEffect(() => {
    if (liveEvents.length > 0) {
      const latest = liveEvents[0]
      setLastEventTime(new Date().toLocaleTimeString())

      if (latest.payload?.headcount !== undefined) {
        setHeadcount(latest.payload.headcount)
        setOccupancyRate(Math.round((latest.payload.headcount / 30) * 100))
      } else if (latest.payload?.observed !== undefined) {
        setHeadcount(latest.payload.observed)
        setOccupancyRate(Math.round((latest.payload.observed / 30) * 100))
      }

      if (latest.payload?.activity_score !== undefined) {
        setActivityScore(Math.round(latest.payload.activity_score * 100))
        setMotionEnergy(latest.payload.activity_score)
      }
    }
  }, [liveEvents])

  return (
    <div className="space-y-5">
      {/* Top Status & Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
            </span>
            <span className="text-sm font-extrabold text-slate-900 tracking-tight font-sans">
              LIVE MONITORING
            </span>
          </div>

          <span className="text-slate-300">|</span>

          {/* Connection status */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500">WebSocket:</span>
            <span className={`font-semibold ${isWsConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isWsConnected ? 'Active (Synced)' : 'Connecting...'}
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Telemetry Packet:</span>
            <span className="font-mono font-semibold text-slate-700">{lastEventTime}</span>
          </div>
        </div>

        {/* Camera Selector Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono font-semibold">
          {(['CAM-01', 'CAM-02', 'CAM-03'] as const).map((cam) => (
            <button
              key={cam}
              onClick={() => setActiveCam(cam)}
              className={`px-3 py-1 rounded transition-colors ${
                activeCam === cam
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cam}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Live Stream on Left, Live Telemetry Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Video Player Feed */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-gov-md relative aspect-video flex items-center justify-center">
            {/* Lab floor grid simulation */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415518_1px,transparent_1px),linear-gradient(to_bottom,#33415518_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Privacy Guarantee Watermark */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-emerald-400 font-mono border border-emerald-500/30 flex items-center gap-1.5 z-10">
              <ShieldCheck className="w-3.5 h-3.5" />
              NON-BIOMETRIC AGGREGATE TRACKING (NO FACIAL RECOGNITION)
            </div>

            {/* Live Headcount Overlay */}
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono font-bold text-white border border-slate-700 flex items-center gap-2 z-10">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>HEADCOUNT: {headcount} PERSONS</span>
            </div>

            {/* Spatial Zone Overlays */}
            <div className="absolute top-12 left-4 text-[9px] font-mono text-blue-300/80 border border-blue-500/30 bg-blue-950/40 px-2 py-0.5 rounded">
              ZONE: WORKSTATIONS (DESKS 1-12)
            </div>
            <div className="absolute top-12 right-4 text-[9px] font-mono text-purple-300/80 border border-purple-500/30 bg-purple-950/40 px-2 py-0.5 rounded">
              ZONE: INSTRUCTOR PODIUM
            </div>

            {/* Simulated Anonymized Bounding Boxes corresponding to headcount */}
            <div className="relative w-full h-full p-4 pointer-events-none">
              {Array.from({ length: Math.min(headcount, 12) }).map((_, idx) => {
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
                    }}
                  >
                    <div className="flex items-center justify-between text-[8px] font-mono text-emerald-300 bg-slate-900/90 px-1 rounded">
                      <span>T#{idx + 101}</span>
                      <span>94%</span>
                    </div>
                    <div className="text-[7px] font-mono text-emerald-300/80 text-center">
                      [Person]
                    </div>
                    <div className="text-[7px] font-mono text-blue-300/80 text-right">
                      v: 0.14 m/s
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Stream Telemetry Bar */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-900/80 px-3 py-1 rounded border border-slate-700">
              <span>MODEL: YOLOv11-Edge-Quantized</span>
              <span>INFERENCE: 34ms @ 15 FPS</span>
              <span className="text-emerald-400">STATUS: OPTIMAL</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Stream Source: RTSP://edge-node-okhla:8554/cam01</span>
            <span className="font-mono text-slate-400">Stream ID: cam-okhla-iot-101</span>
          </div>
        </div>

        {/* Right: Live Telemetry Matrix */}
        <div className="space-y-4">
          <Card title="Live Kinematics & Presence Signals" subtitle="Real-time optical analysis">
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-600">Classroom Occupancy Rate</span>
                  <span className="font-bold text-slate-900 font-tabular">{occupancyRate}% (30 Capacity)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-900 h-full rounded-full transition-all" style={{ width: `${occupancyRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-600">Student Engagement Index</span>
                  <span className="font-bold text-slate-900 font-tabular">{activityScore}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${activityScore}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block font-mono">Kinetic Energy</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">{motionEnergy.toFixed(2)}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block font-mono">Detection Confidence</span>
                  <span className="font-bold text-emerald-700 text-sm font-mono">93.4%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Detected Sanctioned Assets in Feed */}
          <Card title="Detected Physical Assets" subtitle="In-frame inventory cross-check">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                <span>Computer Workstations:</span>
                <span className="font-bold text-slate-900">18 In Frame</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                <span>CNC Machine Trainers:</span>
                <span className="font-bold text-emerald-700">4 In Frame</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                <span>Biometric Kiosk:</span>
                <span className="font-bold text-emerald-700">1 Operational</span>
              </div>
            </div>
          </Card>

          {/* Active Anomalies in this feed */}
          <Card title="Live Anomaly Triggers" subtitle="Automated discrepancy alerts">
            <div className="space-y-2">
              {anomalies.slice(0, 2).map((a) => (
                <div key={a.id} className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-xs">
                  <div className="flex items-center justify-between mb-1 font-bold text-rose-900">
                    <span>{a.type.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-[10px]">{a.severity}</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-tight">{a.explanation}</p>
                </div>
              ))}
              {anomalies.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400">
                  Zero active anomalies on this camera feed.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
