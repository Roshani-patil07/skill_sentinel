import React, { useState } from 'react'
import {
  Zap, AlertOctagon, Laptop, CheckCircle2, Loader2, Sparkles,
  Activity, Repeat, AlertTriangle
} from 'lucide-react'
import { useSentinelStore } from '../store/useSentinelStore'

export const SimulatorToolbar: React.FC = () => {
  const { selectedCentreId } = useSentinelStore()
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null)
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null)

  const triggerScenario = async (scenario: string, label: string) => {
    setLoadingScenario(scenario)
    try {
      const res = await fetch(`/api/v1/simulation/trigger-scenario?centre_id=${selectedCentreId}&scenario=${scenario}`, {
        method: 'POST'
      })
      const data = await res.json()
      setLastActionStatus(`Dispatched: ${label}`)
      setTimeout(() => setLastActionStatus(null), 4500)
    } catch (err) {
      console.error('Simulation error:', err)
      setLastActionStatus('Simulation failed')
    } finally {
      setLoadingScenario(null)
    }
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 via-[#0e172a] to-slate-900 border-b border-gray-800 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              AI Intelligence & Edge Simulator
              <Sparkles className="w-3 h-3 text-amber-400" />
            </span>
            <p className="text-[11px] text-gray-400">
              Zero-Hardware Simulation: Inject real-time edge telemetry, test anomaly detection & risk recalculations
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Normal / Restored */}
          <button
            onClick={() => triggerScenario('NORMAL', 'Full Compliance Restored')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-200 border border-emerald-700/60 text-xs font-semibold shadow-glow-green transition-all active:scale-95 disabled:opacity-50"
            title="Restore all assets and headcount to compliant state"
          >
            {loadingScenario === 'NORMAL' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            )}
            Normal / Compliant
          </button>

          {/* 2. Attendance Mismatch */}
          <button
            onClick={() => triggerScenario('ATTENDANCE_MISMATCH', 'Attendance Discrepancy (32 Reported vs 11 Observed)')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900/90 text-red-200 border border-red-700/60 text-xs font-semibold shadow-glow-red transition-all active:scale-95 disabled:opacity-50"
            title="Inject 32 reported attendance vs 11 physical presence"
          >
            {loadingScenario === 'ATTENDANCE_MISMATCH' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <AlertOctagon className="w-3 h-3 text-red-400" />
            )}
            Attendance Mismatch
          </button>

          {/* 3. Missing Asset */}
          <button
            onClick={() => triggerScenario('MISSING_ASSET', 'Missing Lab Equipment (4 Deficit)')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900/90 text-amber-200 border border-amber-700/60 text-xs font-semibold shadow-glow-amber transition-all active:scale-95 disabled:opacity-50"
            title="Simulate sanctioned workstation/equipment deficit"
          >
            {loadingScenario === 'MISSING_ASSET' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Laptop className="w-3 h-3 text-amber-400" />
            )}
            Missing Asset
          </button>

          {/* 4. Low Activity */}
          <button
            onClick={() => triggerScenario('LOW_ACTIVITY', 'Low Activity / Disengagement')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-200 border border-indigo-700/60 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            title="Simulate inactive session: static room with low motion energy"
          >
            {loadingScenario === 'LOW_ACTIVITY' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Activity className="w-3 h-3 text-indigo-400" />
            )}
            Low Activity
          </button>

          {/* 5. Repeated Anomaly */}
          <button
            onClick={() => triggerScenario('REPEATED_ANOMALY', 'Repeated Multi-Day Anomaly (1.75x Multiplier)')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-950/80 hover:bg-orange-900/90 text-orange-200 border border-orange-700/60 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            title="Simulate repeated discrepancies across 4 consecutive days"
          >
            {loadingScenario === 'REPEATED_ANOMALY' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Repeat className="w-3 h-3 text-orange-400" />
            )}
            Repeated Anomaly
          </button>

          {/* 6. High Risk Compound Failure */}
          <button
            onClick={() => triggerScenario('HIGH_RISK', 'Compound High Risk Crisis (Risk > 85)')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-100 border border-rose-600 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            title="Compound failure: Ghost attendance + stolen assets + disengagement"
          >
            {loadingScenario === 'HIGH_RISK' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-rose-400 animate-bounce" />
            )}
            High Risk Crisis
          </button>
        </div>

        {lastActionStatus && (
          <div className="w-full text-center sm:w-auto text-[11px] font-mono text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded border border-emerald-800 animate-fadeIn">
            ✓ {lastActionStatus}
          </div>
        )}
      </div>
    </div>
  )
}

