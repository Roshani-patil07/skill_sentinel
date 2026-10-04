import React, { useState } from 'react'
import {
  Sliders, Save, RotateCcw, ShieldCheck, Wifi,
  HardDrive, Cpu, CheckCircle2
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { useSentinelStore } from '../store/useSentinelStore'

export const SettingsPage: React.FC = () => {
  const { setToast } = useSentinelStore()

  // 6-pillar weights
  const [wAttendance, setWAttendance] = useState(30)
  const [wInfrastructure, setWInfrastructure] = useState(25)
  const [wActivity, setWActivity] = useState(15)
  const [wHistorical, setWHistorical] = useState(15)
  const [wCamera, setWCamera] = useState(10)
  const [wInspection, setWInspection] = useState(5)

  // Edge & Privacy settings
  const [bandwidthOptimization, setBandwidthOptimization] = useState(true)
  const [privacyBlur, setPrivacyBlur] = useState(true)
  const [edgeMode, setEdgeMode] = useState<'LOCAL' | 'EDGE' | 'SERVER'>('EDGE')

  const totalWeight =
    wAttendance + wInfrastructure + wActivity + wHistorical + wCamera + wInspection

  const handleSave = () => {
    setToast({
      id: Math.random().toString(),
      title: 'Risk Weights & Edge Configuration Updated',
      message: 'New weights committed to AI Risk Engine runtime.',
      severity: 'SUCCESS',
    })
  }

  const handleReset = () => {
    setWAttendance(30)
    setWInfrastructure(25)
    setWActivity(15)
    setWHistorical(15)
    setWCamera(10)
    setWInspection(5)
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          System Administration
        </span>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          System Configuration & AI Risk Formula
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tune regulatory risk factor weights, edge bandwidth controls, and privacy filters
        </p>
      </div>

      {/* Card 1: Configurable Multi-Pillar Risk Engine */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span>6-Pillar Risk Formula Weight Calibration</span>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                totalWeight === 100
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              Sum: {totalWeight}% {totalWeight === 100 ? '(Balanced)' : '(Must Equal 100%)'}
            </span>
          </div>
        }
        subtitle="Configure the mathematical weight for each intelligence signal"
        footer={
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults (30/25/15/15/10/5)</span>
            </button>
            <button
              onClick={handleSave}
              disabled={totalWeight !== 100}
              className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply Weights</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between font-bold mb-1">
              <span className="text-slate-800">1. Attendance Discrepancy Weight</span>
              <span className="font-mono text-blue-900">{wAttendance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={wAttendance}
              onChange={(e) => setWAttendance(Number(e.target.value))}
              className="w-full accent-blue-900"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span className="text-slate-800">2. Infrastructure Compliance Weight</span>
              <span className="font-mono text-blue-900">{wInfrastructure}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={wInfrastructure}
              onChange={(e) => setWInfrastructure(Number(e.target.value))}
              className="w-full accent-blue-900"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span className="text-slate-800">3. Classroom Activity & Kinematics Weight</span>
              <span className="font-mono text-blue-900">{wActivity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={wActivity}
              onChange={(e) => setWActivity(Number(e.target.value))}
              className="w-full accent-blue-900"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span className="text-slate-800">4. Longitudinal Repeat Pattern Weight</span>
              <span className="font-mono text-blue-900">{wHistorical}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={wHistorical}
              onChange={(e) => setWHistorical(Number(e.target.value))}
              className="w-full accent-blue-900"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span className="text-slate-800">5. Camera Device Reliability Weight</span>
              <span className="font-mono text-blue-900">{wCamera}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={wCamera}
              onChange={(e) => setWCamera(Number(e.target.value))}
              className="w-full accent-blue-900"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span className="text-slate-800">6. Physical Inspection Status Weight</span>
              <span className="font-mono text-blue-900">{wInspection}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={wInspection}
              onChange={(e) => setWInspection(Number(e.target.value))}
              className="w-full accent-blue-900"
            />
          </div>
        </div>
      </Card>

      {/* Card 2: Edge Bandwidth & Privacy Architecture */}
      <Card title="Edge Node Architecture & Bandwidth Preservation" subtitle="Optimized for tier-2/3 connectivity">
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div>
              <span className="font-bold text-slate-900 block">Low-Bandwidth Telemetry Ingestion</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Transmits lightweight ~1.4 KB JSON event packets instead of continuous raw video streaming.
              </p>
            </div>
            <input
              type="checkbox"
              checked={bandwidthOptimization}
              onChange={(e) => setBandwidthOptimization(e.target.checked)}
              className="w-4 h-4 accent-blue-900 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div>
              <span className="font-bold text-slate-900 block">Non-Biometric Privacy Filter</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Zero facial recognition guarantee. Applies edge Gaussian blur on snapshots captured for audits.
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacyBlur}
              onChange={(e) => setPrivacyBlur(e.target.checked)}
              className="w-4 h-4 accent-blue-900 rounded"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
