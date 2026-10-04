import React, { useState } from 'react'
import {
  Sparkles, CheckCircle2, AlertOctagon, Laptop,
  Activity, Repeat, AlertTriangle, Loader2, Play, RotateCcw,
  QrCode, FileCheck, ArrowRight, ShieldCheck
} from 'lucide-react'
import { useSentinelStore } from '../../store/useSentinelStore'

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, selectedCentreId, setSelectedCentreId, updateCentreRisk, setToast } = useSentinelStore()
  const [loadingScen, setLoadingScen] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [sihStep, setSihStep] = useState<number>(0)
  const [autoPlaying, setAutoPlaying] = useState<boolean>(false)

  if (!isDemoMode) return null

  // Generic scenario trigger
  const triggerGeneric = async (scenario: string, label: string) => {
    setLoadingScen(scenario)
    try {
      const res = await fetch(`/api/v1/simulation/trigger-scenario?centre_id=${selectedCentreId}&scenario=${scenario}`, {
        method: 'POST',
      })
      await res.json()
      setStatusMsg(`Simulated: ${label}`)
      setToast({
        id: String(Date.now()),
        title: 'Simulation Injected',
        message: `Scenario ${label} successfully broadcast.`,
        severity: 'INFO'
      })
      setTimeout(() => setStatusMsg(null), 4000)
    } catch (e) {
      console.error(e)
      setStatusMsg('Failed to inject simulation')
    } finally {
      setLoadingScen(null)
    }
  }

  // SIH 2026 5-Minute Demo Specific Stage Triggers
  const runSihDemoStage = async (stage: number) => {
    setLoadingScen(`sih-stage-${stage}`)
    setSelectedCentreId('tc-pune-047')
    try {
      let endpoint = '/api/v1/demo/reset'
      let stageTitle = 'Pune-047 Reset'
      let stageDesc = 'Reset to baseline risk 54.0'
      let targetRisk = 54
      let targetLevel = 'HIGH'

      if (stage === 0) {
        endpoint = '/api/v1/demo/reset'
        stageTitle = 'Pune-047 Baseline Reset'
        stageDesc = 'Initial state: Risk 54 (Watchlist)'
        targetRisk = 54
        targetLevel = 'HIGH'
      } else if (stage === 1) {
        endpoint = '/api/v1/demo/stage-1-attendance'
        stageTitle = 'Stage 1: Attendance Discrepancy'
        stageDesc = 'AI detects 28 claimed vs 9 observed. Risk escalated to 72.'
        targetRisk = 72
        targetLevel = 'HIGH'
      } else if (stage === 2) {
        endpoint = '/api/v1/demo/stage-2-missing-asset'
        stageTitle = 'Stage 2: Sanctioned Asset Missing'
        stageDesc = 'CNC Machining Trainer missing. Risk escalated to 86 (CRITICAL). Targeted inspection recommended.'
        targetRisk = 86
        targetLevel = 'CRITICAL'
      } else if (stage === 3) {
        endpoint = '/api/v1/demo/stage-3-qr-ar-scan'
        stageTitle = 'Stage 3: Field Verification'
        stageDesc = 'QR confirms registered. AI confirms physically present. Maintenance: OVERDUE.'
        targetRisk = 86
        targetLevel = 'CRITICAL'
      } else if (stage === 4) {
        endpoint = '/api/v1/demo/stage-4-resolve'
        stageTitle = 'Stage 4: Compliance Re-evaluated'
        stageDesc = 'Officer submitted evidence. Intervention RESOLVED. Risk drops to 36 (HEALTHY).'
        targetRisk = 36
        targetLevel = 'MODERATE'
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      await res.json()
      setSihStep(stage)
      updateCentreRisk('tc-pune-047', targetRisk, targetLevel)
      setStatusMsg(stageTitle)
      setToast({
        id: String(Date.now()),
        title: stageTitle,
        message: stageDesc,
        severity: targetRisk >= 85 ? 'CRITICAL' : targetRisk >= 70 ? 'WARNING' : 'SUCCESS'
      })
      setTimeout(() => setStatusMsg(null), 5000)
    } catch (err) {
      console.error('Failed to run SIH stage:', err)
      setStatusMsg('Stage execution error')
    } finally {
      setLoadingScen(null)
    }
  }

  // Auto-play complete 5-minute SIH demonstration sequence
  const startAutoPlay = async () => {
    if (autoPlaying) return
    setAutoPlaying(true)
    for (let step = 0; step <= 4; step++) {
      await runSihDemoStage(step)
      // Pause 4 seconds between steps for presenter explanation
      await new Promise(r => setTimeout(r, 4000))
    }
    setAutoPlaying(false)
  }

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 shadow-md">
      {/* Top Banner: SIH 2026 Targeted Demo Controller */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-500/20 text-amber-400 p-1 rounded border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-400 font-mono text-[11px] tracking-wider uppercase">
                SIH 2026 Official Walkthrough Controller
              </span>
              <span className="bg-blue-900/60 text-blue-300 font-mono text-[10px] px-1.5 py-0.2 rounded border border-blue-700/50">
                Target: Pune-047
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              5-minute sequential demonstration of real-time AI anomaly detection, risk escalation, QR field verification, and resolution.
            </p>
          </div>
        </div>

        {/* Stepper buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="btn-demo-reset"
            onClick={() => runSihDemoStage(0)}
            disabled={loadingScen !== null || autoPlaying}
            title="Step 0: Baseline state (Pune-047 Risk: 54)"
            className={`px-2 py-1 rounded text-[11px] font-mono font-medium flex items-center gap-1 border transition-all ${
              sihStep === 0
                ? 'bg-slate-700 text-white border-slate-500 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {loadingScen === 'sih-stage-0' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3 text-slate-400" />}
            0: Baseline (54)
          </button>

          <button
            id="btn-demo-stage1"
            onClick={() => runSihDemoStage(1)}
            disabled={loadingScen !== null || autoPlaying}
            title="Step 1: Attendance gap (28 claimed vs 9 seen) -> Risk: 72"
            className={`px-2 py-1 rounded text-[11px] font-mono font-medium flex items-center gap-1 border transition-all ${
              sihStep === 1
                ? 'bg-amber-900/80 text-amber-100 border-amber-500 shadow-sm'
                : 'bg-slate-800/80 text-amber-300/80 border-slate-700 hover:bg-amber-950/60'
            }`}
          >
            {loadingScen === 'sih-stage-1' ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertOctagon className="w-3 h-3 text-amber-400" />}
            1: Attendance (→72)
          </button>

          <button
            id="btn-demo-stage2"
            onClick={() => runSihDemoStage(2)}
            disabled={loadingScen !== null || autoPlaying}
            title="Step 2: Missing CNC Equipment -> Risk: 86 (Targeted Inspection recommended)"
            className={`px-2 py-1 rounded text-[11px] font-mono font-medium flex items-center gap-1 border transition-all ${
              sihStep === 2
                ? 'bg-rose-900/80 text-rose-100 border-rose-500 shadow-sm'
                : 'bg-slate-800/80 text-rose-300/80 border-slate-700 hover:bg-rose-950/60'
            }`}
          >
            {loadingScen === 'sih-stage-2' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Laptop className="w-3 h-3 text-rose-400" />}
            2: Missing Asset (→86)
          </button>

          <button
            id="btn-demo-stage3"
            onClick={() => runSihDemoStage(3)}
            disabled={loadingScen !== null || autoPlaying}
            title="Step 3: Officer field QR/AR scan confirms physical presence; flags overdue maintenance"
            className={`px-2 py-1 rounded text-[11px] font-mono font-medium flex items-center gap-1 border transition-all ${
              sihStep === 3
                ? 'bg-indigo-900/80 text-indigo-100 border-indigo-500 shadow-sm'
                : 'bg-slate-800/80 text-indigo-300/80 border-slate-700 hover:bg-indigo-950/60'
            }`}
          >
            {loadingScen === 'sih-stage-3' ? <Loader2 className="w-3 h-3 animate-spin" /> : <QrCode className="w-3 h-3 text-indigo-400" />}
            3: QR Scan (Overdue)
          </button>

          <button
            id="btn-demo-stage4"
            onClick={() => runSihDemoStage(4)}
            disabled={loadingScen !== null || autoPlaying}
            title="Step 4: Evidence submitted -> Intervention resolved -> Risk recalculates to 36"
            className={`px-2 py-1 rounded text-[11px] font-mono font-medium flex items-center gap-1 border transition-all ${
              sihStep === 4
                ? 'bg-emerald-900/80 text-emerald-100 border-emerald-500 shadow-sm'
                : 'bg-slate-800/80 text-emerald-300/80 border-slate-700 hover:bg-emerald-950/60'
            }`}
          >
            {loadingScen === 'sih-stage-4' ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
            4: Resolve (→36)
          </button>

          <button
            id="btn-demo-autoplay"
            onClick={startAutoPlay}
            disabled={loadingScen !== null || autoPlaying}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1 transition-all ${
              autoPlaying
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
            }`}
          >
            {autoPlaying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {autoPlaying ? 'Running Auto...' : 'Auto-Play 5-Min'}
          </button>
        </div>
      </div>

      {/* Sub-Banner: Generic Telemetry Injections & Status */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-[10px] uppercase">Telemetry Injections:</span>
          <button
            onClick={() => triggerGeneric('NORMAL', 'Full Compliance Recovery')}
            disabled={loadingScen !== null}
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] transition-all"
          >
            Normal
          </button>
          <button
            onClick={() => triggerGeneric('ATTENDANCE_MISMATCH', 'Attendance Mismatch')}
            disabled={loadingScen !== null}
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] transition-all"
          >
            Ghost Trainees
          </button>
          <button
            onClick={() => triggerGeneric('MISSING_ASSET', 'Asset Deficit')}
            disabled={loadingScen !== null}
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] transition-all"
          >
            Missing Assets
          </button>
          <button
            onClick={() => triggerGeneric('LOW_ACTIVITY', 'Inactivity Anomaly')}
            disabled={loadingScen !== null}
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] transition-all"
          >
            Low Activity
          </button>
          <button
            onClick={() => triggerGeneric('HIGH_RISK', 'Compound Crisis')}
            disabled={loadingScen !== null}
            className="px-1.5 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] font-semibold transition-all"
          >
            Compound Crisis
          </button>
        </div>

        {statusMsg && (
          <span className="font-mono text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1 animate-fadeIn">
            ✓ {statusMsg}
          </span>
        )}
      </div>
    </div>
  )
}
