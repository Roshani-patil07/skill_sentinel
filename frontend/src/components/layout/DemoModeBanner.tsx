import React, { useState } from 'react'
import {
  Sparkles, CheckCircle2, AlertOctagon, Laptop,
  Activity, Play, RotateCcw, QrCode, ShieldCheck,
  ChevronDown, ChevronUp, Loader2, Gauge, Radio, Zap
} from 'lucide-react'
import { useSentinelStore } from '../../store/useSentinelStore'

export const DemoModeBanner: React.FC = () => {
  const {
    isDemoMode,
    selectedCentreId,
    setSelectedCentreId,
    updateCentreRisk,
    setToast,
    centres,
  } = useSentinelStore()

  const [loadingScen, setLoadingScen] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [sihStep, setSihStep] = useState<number>(0)
  const [autoPlaying, setAutoPlaying] = useState<boolean>(false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  if (!isDemoMode) return null

  // Generic scenario trigger
  const triggerGeneric = async (scenario: string, label: string) => {
    setLoadingScen(scenario)
    try {
      const res = await fetch(`/api/v1/simulation/trigger-scenario?centre_id=${selectedCentreId}&scenario=${scenario}`, {
        method: 'POST',
      }).catch(() => null)
      if (res) await res.json().catch(() => null)

      setStatusMsg(`Telemetry Injected: ${label}`)
      setToast({
        id: String(Date.now()),
        title: 'Simulation Telemetry Broadcast',
        message: `Scenario '${label}' applied to ${selectedCentreId}.`,
        severity: 'INFO',
      })
      setTimeout(() => setStatusMsg(null), 4000)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingScen(null)
    }
  }

  // SIH 5-Minute Demo Stage Triggers
  const runSihDemoStage = async (stage: number) => {
    setLoadingScen(`sih-stage-${stage}`)
    setSelectedCentreId('tc-pune-047')
    try {
      let endpoint = '/api/v1/demo/reset'
      let stageTitle = 'Stage 0: Pune-047 Baseline'
      let stageDesc = 'Initial state: Risk 54 (Watchlist). Standard training operations.'
      let targetRisk = 54
      let targetLevel = 'MODERATE'

      if (stage === 0) {
        endpoint = '/api/v1/demo/reset'
        stageTitle = 'Stage 0: Baseline Reset'
        stageDesc = 'Initial state: Risk 54 (Watchlist monitoring). Standard operations.'
        targetRisk = 54
        targetLevel = 'MODERATE'
      } else if (stage === 1) {
        endpoint = '/api/v1/demo/stage-1-attendance'
        stageTitle = 'Stage 1: Attendance Discrepancy Flagged'
        stageDesc = 'AI Vision detects 8 attendees vs 28 Aadhaar biometric claims. Risk escalated to 72.'
        targetRisk = 72
        targetLevel = 'HIGH'
      } else if (stage === 2) {
        endpoint = '/api/v1/demo/stage-2-missing-asset'
        stageTitle = 'Stage 2: Critical Asset Deficit Detected'
        stageDesc = 'Haas CNC Lathe missing from bay. Risk escalated to 86 (CRITICAL). Targeted field audit triggered.'
        targetRisk = 86
        targetLevel = 'CRITICAL'
      } else if (stage === 3) {
        endpoint = '/api/v1/demo/stage-3-qr-ar-scan'
        stageTitle = 'Stage 3: Field QR/AR Audit Performed'
        stageDesc = 'Auditor verifies physical presence via secure QR; flags overdue calibration & maintenance.'
        targetRisk = 86
        targetLevel = 'CRITICAL'
      } else if (stage === 4) {
        endpoint = '/api/v1/demo/stage-4-resolve'
        stageTitle = 'Stage 4: Compliance Restored & Resolved'
        stageDesc = 'Certified evidence submitted. Intervention closed. Risk re-evaluated to 36 (HEALTHY).'
        targetRisk = 36
        targetLevel = 'LOW'
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).catch(() => null)
      if (res) await res.json().catch(() => null)

      setSihStep(stage)
      updateCentreRisk('tc-pune-047', targetRisk, targetLevel)
      setStatusMsg(stageTitle)
      setToast({
        id: String(Date.now()),
        title: stageTitle,
        message: stageDesc,
        severity: targetRisk >= 85 ? 'CRITICAL' : targetRisk >= 70 ? 'WARNING' : 'SUCCESS',
      })
      setTimeout(() => setStatusMsg(null), 5000)
    } catch (err) {
      console.error('Failed to run SIH stage:', err)
      setStatusMsg('Stage applied in local mode')
    } finally {
      setLoadingScen(null)
    }
  }

  // Auto-play complete demonstration sequence
  const startAutoPlay = async () => {
    if (autoPlaying) return
    setAutoPlaying(true)
    for (let step = 0; step <= 4; step++) {
      await runSihDemoStage(step)
      await new Promise((r) => setTimeout(r, 4200))
    }
    setAutoPlaying(false)
  }

  const stages = [
    { num: 0, label: '0. Baseline', risk: '54', desc: 'Watchlist baseline' },
    { num: 1, label: '1. Ghost Attendance', risk: '72', desc: '8 observed vs 28 claimed' },
    { num: 2, label: '2. Asset Deficit', risk: '86', desc: 'Missing CNC Machine' },
    { num: 3, label: '3. QR Verification', risk: '86', desc: 'Field Audit Overdue' },
    { num: 4, label: '4. Case Resolved', risk: '36', desc: 'Compliance Restored' },
  ]

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 shadow-sm relative z-30 transition-all">
      {/* Top Controller Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase font-mono text-slate-300">
              National Simulation Engine
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
            <span className="text-slate-400 font-mono text-[10px]">TARGET:</span>
            <span className="font-semibold text-white">Pune-047</span>
            <span className="text-slate-400 text-[10px]">(PMKK Precision Eng)</span>
          </div>

          {statusMsg && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-[10px] animate-fade-in">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {statusMsg}
            </span>
          )}
        </div>

        {/* Right: Actions & Collapse Toggle */}
        <div className="flex items-center gap-2">
          {/* Auto-Play 5-Minute Sequence */}
          <button
            onClick={startAutoPlay}
            disabled={loadingScen !== null || autoPlaying}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
              autoPlaying
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
            title="Auto-advance through all 5 walkthrough stages automatically"
          >
            {autoPlaying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{autoPlaying ? 'Auto-Advancing (5-Min)...' : 'Auto-Play Sequence'}</span>
          </button>

          {/* Quick Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Simulation Controls' : 'Collapse Simulation Controls'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Walkthrough Stepper & Scenario Injection Chips */}
      {!isCollapsed && (
        <div className="max-w-7xl mx-auto px-4 pb-2.5 pt-1 border-t border-slate-800/80 space-y-2">
          {/* Stepper Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stages.map((stg) => {
              const isSelected = sihStep === stg.num
              return (
                <button
                  key={stg.num}
                  onClick={() => runSihDemoStage(stg.num)}
                  disabled={loadingScen !== null || autoPlaying}
                  className={`p-2 rounded-lg text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? stg.num === 4
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100 shadow-xs ring-1 ring-emerald-500/40'
                        : stg.num >= 2
                        ? 'bg-rose-950/70 border-rose-500 text-rose-100 shadow-xs ring-1 ring-rose-500/40'
                        : stg.num === 1
                        ? 'bg-amber-950/70 border-amber-500 text-amber-100 shadow-xs ring-1 ring-amber-500/40'
                        : 'bg-slate-800 border-slate-600 text-white shadow-xs'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="truncate">{stg.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${
                        Number(stg.risk) >= 85
                          ? 'bg-rose-900 text-rose-200'
                          : Number(stg.risk) >= 70
                          ? 'bg-amber-900 text-amber-200'
                          : Number(stg.risk) >= 50
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-emerald-900 text-emerald-200'
                      }`}
                    >
                      Risk {stg.risk}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    {stg.desc}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Quick Scenario Injections */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 text-[10px] font-mono uppercase">Quick Anomaly Injections:</span>
              <button
                onClick={() => triggerGeneric('NORMAL', 'Operational Baseline')}
                disabled={loadingScen !== null}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-medium transition-colors"
              >
                Normal
              </button>
              <button
                onClick={() => triggerGeneric('ATTENDANCE_MISMATCH', 'Ghost Trainees Flagged')}
                disabled={loadingScen !== null}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[10px] font-medium transition-colors"
              >
                Ghost Trainees
              </button>
              <button
                onClick={() => triggerGeneric('MISSING_ASSET', 'Missing Machine Equipment')}
                disabled={loadingScen !== null}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-[10px] font-medium transition-colors"
              >
                Missing Asset
              </button>
              <button
                onClick={() => triggerGeneric('LOW_ACTIVITY', 'Inactivity Anomaly')}
                disabled={loadingScen !== null}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-medium transition-colors"
              >
                Low Activity
              </button>
              <button
                onClick={() => triggerGeneric('HIGH_RISK', 'Compound Crisis Multiplier')}
                disabled={loadingScen !== null}
                className="px-2 py-0.5 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800 text-[10px] font-semibold transition-colors"
              >
                Compound Crisis
              </button>
            </div>

            <div className="text-[10px] text-slate-400 font-mono hidden md:block">
              Press buttons to trigger live event propagation across all connected nodes
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
