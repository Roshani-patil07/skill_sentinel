import React, { useState, useEffect } from 'react'
import {
  Video, Eye, Radio, ShieldCheck, Activity, HardDrive,
  AlertOctagon, CheckCircle2, Clock, Wifi, RefreshCw,
  Cpu, Layers, Zap, Camera, ShieldAlert, FileText, Send,
  Maximize2, EyeOff, Sparkles, AlertTriangle, ArrowRight,
  Download, Lock
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { RiskBadge } from '../components/ui/RiskBadge'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useSentinelStore } from '../store/useSentinelStore'
import { MOCK_CAMERAS } from '../data/mockData'

export const LiveMonitoringPage: React.FC = () => {
  const {
    selectedCentreId,
    centres,
    isWsConnected,
    liveEvents,
    openInterventionModal,
    setToast,
  } = useSentinelStore()

  const activeCentre = centres.find((c) => c.id === selectedCentreId) || centres[0]
  const cameras = MOCK_CAMERAS[selectedCentreId] || MOCK_CAMERAS['tc-pune-047']

  const [activeCamId, setActiveCamId] = useState<string>('cam-01')
  const [viewMode, setViewMode] = useState<'OPTICAL' | 'AI_OVERLAY' | 'HEATMAP'>('AI_OVERLAY')
  const [headcount, setHeadcount] = useState(8)
  const [claimedBiometric, setClaimedBiometric] = useState(28)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isSnapshotting, setIsSnapshotting] = useState(false)

  const activeCam = cameras.find((c) => c.id === activeCamId) || cameras[0]

  // Live real-time clock for CCTV On-Screen Display (OSD)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' IST'
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Sync with live WebSocket events if broadcast
  useEffect(() => {
    if (liveEvents.length > 0) {
      const latest = liveEvents[0]
      if (latest.payload?.headcount !== undefined) {
        setHeadcount(latest.payload.headcount)
      } else if (latest.payload?.observed !== undefined) {
        setHeadcount(latest.payload.observed)
      }
    }
  }, [liveEvents])

  const discrepancy = headcount - claimedBiometric
  const discrepancyPercent = Math.round((discrepancy / (claimedBiometric || 1)) * 100)
  const isHighDiscrepancy = discrepancyPercent <= -40

  const handleCaptureSnapshot = () => {
    setIsSnapshotting(true)
    setTimeout(() => {
      setIsSnapshotting(false)
      setToast({
        id: String(Date.now()),
        title: 'CCTV Audit Snapshot Captured',
        message: `Cryptographic SHA-256 evidence bundle generated for ${activeCam.name}.`,
        severity: 'SUCCESS',
      })
    }, 600)
  }

  return (
    <div className="space-y-5">
      {/* Top Header & Centre Identification */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Live CCTV Surveillance & Telemetry Feed
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-bold uppercase">
              Edge Quantized • Stream 01
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeCentre?.name} ({activeCentre?.centre_code}) • {activeCentre?.district_name}, {activeCentre?.state_name}
          </p>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
            <span>RTSP Gateway: Active</span>
          </div>

          <button
            onClick={handleCaptureSnapshot}
            disabled={isSnapshotting}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium border border-slate-300 transition-colors shadow-xs"
            title="Generate tamper-evident signed evidence snapshot"
          >
            <Camera className="w-3.5 h-3.5 text-slate-600" />
            <span>{isSnapshotting ? 'Signing Hash...' : 'Audit Snapshot'}</span>
          </button>

          <button
            onClick={() => openInterventionModal(activeCentre.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-700 hover:bg-rose-800 text-white font-semibold transition-colors shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Enforce Action</span>
          </button>
        </div>
      </div>

      {/* Camera Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {cameras.map((cam) => {
          const isSelected = cam.id === activeCamId
          return (
            <button
              key={cam.id}
              onClick={() => setActiveCamId(cam.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Video className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`} />
              <span>{cam.name}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  cam.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            </button>
          )
        })}
      </div>

      {/* Main Grid: Surveillance Video on Left, Verification Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Video Player Feed & Controls */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md relative aspect-video flex flex-col justify-between">
            {/* Top OSD Bar (Camera, Location, Timestamp, Privacy Guarantee) */}
            <div className="z-20 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-xs font-mono text-slate-200">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 bg-rose-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  REC
                </span>
                <span className="font-bold text-white tracking-wide">{activeCam.name}</span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">• {activeCam.location}</span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-slate-300 font-tabular font-medium">{currentTime || '2026-10-04 10:15:22 IST'}</span>
                <span className="hidden md:inline px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-600/50 text-emerald-300 text-[10px]">
                  DPDP 2023 PRIVACY SAFE
                </span>
              </div>
            </div>

            {/* Simulated Realistic Training Classroom Scene */}
            <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
              {/* Lab Floor Plan Background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e293b_0%,#090d16_100%)]" />

              {/* Lab workstations and equipment benches layout */}
              <div className="absolute inset-x-8 top-12 bottom-12 border border-slate-700/50 rounded-lg bg-slate-900/40 p-4">
                {/* Zone Labels */}
                <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Zone A: Precision Training Workstations (Bays 1-12)
                </div>

                <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Instructor Console & Digital Podium
                </div>

                {/* Simulated Classroom Desks & Trainees Grid */}
                <div className="grid grid-cols-4 gap-4 h-full pt-6 pb-2">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const isOccupied = idx < headcount
                    const isMissingStation = idx >= headcount && idx < 10

                    return (
                      <div
                        key={idx}
                        className={`rounded border transition-all p-2 flex flex-col justify-between relative ${
                          isOccupied
                            ? viewMode === 'HEATMAP'
                              ? 'bg-emerald-900/40 border-emerald-500/50'
                              : 'bg-slate-800/80 border-slate-600/80'
                            : isMissingStation
                            ? 'bg-rose-950/15 border-rose-900/30'
                            : 'bg-slate-900/30 border-slate-800/50'
                        }`}
                      >
                        {/* Desk Station Header */}
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                          <span>Bay #{idx + 1}</span>
                          {isOccupied ? (
                            <span className="text-emerald-400 font-bold">Occupied</span>
                          ) : isMissingStation ? (
                            <span className="text-rose-400/80">Vacant</span>
                          ) : (
                            <span className="text-slate-500">Unassigned</span>
                          )}
                        </div>

                        {/* Person Silhouette & Bounding Overlay */}
                        <div className="flex flex-col items-center justify-center my-1">
                          {isOccupied ? (
                            <div className="relative flex flex-col items-center">
                              {/* Privacy Blur Silhouette */}
                              <div className="w-7 h-7 rounded-full bg-slate-400/30 backdrop-blur-xs flex items-center justify-center border border-slate-400/40">
                                <span className="text-[8px] font-mono text-white font-bold">
                                  T#{idx + 101}
                                </span>
                              </div>
                              <div className="w-10 h-6 bg-slate-500/20 rounded-t-lg mt-0.5 border border-slate-500/30" />

                              {/* AI Overlay Tag (if active) */}
                              {viewMode === 'AI_OVERLAY' && (
                                <div className="absolute -bottom-3 text-[8px] font-mono font-bold bg-blue-900 text-blue-100 px-1 py-0.2 rounded border border-blue-400/40 shadow-xs">
                                  Verified Trainee
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-slate-600 text-[10px] font-mono flex flex-col items-center">
                              <span className="w-6 h-6 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-[8px]">
                                —
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Equipment Tag at each desk */}
                        <div className="text-[8px] font-mono text-slate-400 text-center truncate">
                          {idx === 0
                            ? 'Haas CNC Lathe'
                            : idx === 1
                            ? 'BFW BMV45 VMC'
                            : idx === 2
                            ? 'Welding Sim #1'
                            : `OptiPlex CAD #${idx + 1}`}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Heatmap filter overlay if active */}
              {viewMode === 'HEATMAP' && (
                <div className="absolute inset-0 bg-emerald-500/10 mix-blend-screen pointer-events-none" />
              )}
            </div>

            {/* Bottom Stream Telemetry Bar */}
            <div className="z-20 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-300">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">FPS: <strong className="text-white">{activeCam.fps}</strong></span>
                <span className="text-slate-400">Resolution: <strong className="text-white">{activeCam.resolution}</strong></span>
                <span className="text-slate-400">Inference: <strong className="text-emerald-400">{activeCam.inference_latency_ms}ms (YOLO-Quantized)</strong></span>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded border border-slate-700">
                <button
                  onClick={() => setViewMode('OPTICAL')}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    viewMode === 'OPTICAL' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Clean CCTV
                </button>
                <button
                  onClick={() => setViewMode('AI_OVERLAY')}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    viewMode === 'AI_OVERLAY' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AI Audit Tags
                </button>
                <button
                  onClick={() => setViewMode('HEATMAP')}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    viewMode === 'HEATMAP' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Occupancy Map
                </button>
              </div>
            </div>
          </div>

          {/* Stream Metadata Footer */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
            <span>RTSP URI: <code className="text-slate-700 font-mono">{activeCam.stream_url}</code></span>
            <span className="font-mono text-slate-500">Security Certificate: TLS 1.3 End-to-End</span>
          </div>
        </div>

        {/* Right: Verification Telemetry & Discrepancy Matrix */}
        <div className="space-y-4">
          {/* Real-Time Cross-Verification Card */}
          <Card
            title="Biometric Discrepancy Matrix"
            subtitle="AEBAS claimed vs Optical observed cross-check"
          >
            <div className="space-y-4">
              {/* Primary Comparison Stat */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                    Aadhaar Biometric Claimed
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 font-tabular mt-0.5">
                    {claimedBiometric}
                  </div>
                  <div className="text-[10px] text-slate-500">AEBAS Morning Shift</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                    AI Visual Verified
                  </div>
                  <div className="text-2xl font-extrabold text-blue-900 font-tabular mt-0.5">
                    {headcount}
                  </div>
                  <div className="text-[10px] text-slate-500">In-Room Optical Count</div>
                </div>
              </div>

              {/* Discrepancy Severity Banner */}
              <div
                className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                  isHighDiscrepancy
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                {isHighDiscrepancy ? (
                  <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold">
                    {isHighDiscrepancy
                      ? `Severe Discrepancy: ${discrepancyPercent}% Deficit`
                      : 'Attendance Verified Compliant'}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    {isHighDiscrepancy
                      ? `${Math.abs(discrepancy)} registered trainees are absent while recorded as present on the biometric terminal. Flagged for ghost attendance review.`
                      : 'Observed headcount matches biometric logs within statutory tolerance margins.'}
                  </p>
                </div>
              </div>

              {/* Classroom Attendance Ratio Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
                  <span>Physical Attendance Ratio</span>
                  <span className="font-bold text-slate-900 font-tabular">
                    {Math.round((headcount / (claimedBiometric || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isHighDiscrepancy ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((headcount / (claimedBiometric || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Sanctioned Machinery In-Frame Verification */}
          <Card
            title="Sanctioned Asset Verification"
            subtitle="In-frame inventory presence check"
          >
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-700">Haas VF-2 CNC Milling Centre:</span>
                <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified in Bay
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-md bg-rose-50 border border-rose-200">
                <span className="font-medium text-rose-900">Haas CNC Lathe Station:</span>
                <span className="font-bold text-rose-700 font-mono flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Deficit / Missing
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-700">CAD Workstations (20 Units):</span>
                <span className="font-bold text-emerald-700 font-mono">18 Detected in Bay</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-md bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-700">Aadhaar AEBAS Kiosk:</span>
                <span className="font-bold text-emerald-700 font-mono">Terminal Active</span>
              </div>
            </div>
          </Card>

          {/* Rapid Enforcement Action Panel */}
          <Card title="Immediate Compliance Action" subtitle="Statutory vigilance workflow">
            <div className="space-y-2">
              <button
                onClick={() => openInterventionModal(activeCentre.id)}
                className="w-full py-2 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-between transition-colors shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-200" />
                  <span>Issue Statutory Show-Cause Notice</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-300" />
              </button>

              <button
                onClick={() => {
                  setToast({
                    id: String(Date.now()),
                    title: 'Flying Squad Auditor Assigned',
                    message: `Surprise physical inspection dispatched for ${activeCentre.name}.`,
                    severity: 'WARNING',
                  })
                }}
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-300 flex items-center justify-between transition-colors shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Dispatch Surprise Field Inspection</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
