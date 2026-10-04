import React, { useState } from 'react'
import {
  ScanEye, Camera, CheckCircle2, AlertTriangle, ShieldCheck,
  HardDrive, Sparkles, RefreshCw, Eye, Check, X
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'

interface ARObject {
  id: string
  name: string
  category: string
  tag: string
  x: number // % from left
  y: number // % from top
  registered: boolean
  correctCentre: boolean
  maintenanceStatus: 'COMPLIANT' | 'OVERDUE'
  expected: boolean
}

export const ARInspectionPage: React.FC = () => {
  const [selectedObj, setSelectedObj] = useState<ARObject | null>(null)
  const [arActive, setArActive] = useState(true)
  const [snapshotTaken, setSnapshotTaken] = useState(false)

  const arObjects: ARObject[] = [
    {
      id: 'ar-1',
      name: 'Haas VF-2 CNC Milling Trainer',
      category: 'CNC MACHINE',
      tag: 'OKH-CNC-2026-001',
      x: 32,
      y: 42,
      registered: true,
      correctCentre: true,
      maintenanceStatus: 'COMPLIANT',
      expected: true,
    },
    {
      id: 'ar-2',
      name: 'Dell OptiPlex 7090 Tower',
      category: 'COMPUTER WORKSTATION',
      tag: 'OKH-PC-2026-004',
      x: 68,
      y: 35,
      registered: true,
      correctCentre: true,
      maintenanceStatus: 'COMPLIANT',
      expected: true,
    },
    {
      id: 'ar-3',
      name: 'Lincoln Electric VR Welding Simulator',
      category: 'WELDING SIMULATOR',
      tag: 'OKH-WLD-2026-002',
      x: 52,
      y: 65,
      registered: true,
      correctCentre: true,
      maintenanceStatus: 'OVERDUE',
      expected: true,
    },
  ]

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Next-Gen Spatial Auditing
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>AR Room Inspection Mode</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 text-xs font-mono font-bold border border-blue-200">
              WebXR Architecture
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial visual inspection overlaying expected vs physical lab equipment in real time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSnapshotTaken(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Capture AR Audit Frame</span>
          </button>
        </div>
      </div>

      {/* AR Viewport Container */}
      <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-gov-md relative aspect-video flex items-center justify-center">
        {/* Spatial Grid Simulation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415518_1px,transparent_1px),linear-gradient(to_bottom,#33415518_1px,transparent_1px)] bg-[size:28px_28px]" />

        {/* Viewfinder crosshairs */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-blue-400/20 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-blue-400/20 pointer-events-none" />

        {/* Status header overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-blue-300 border border-slate-700 flex items-center gap-2 z-10">
          <ScanEye className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>AR TRACKING: 3 ASSET TARGETS IN SPATIAL FOV</span>
        </div>

        {/* Spatial Targets in Room */}
        {arObjects.map((obj) => {
          const isSelected = selectedObj?.id === obj.id
          const isOverdue = obj.maintenanceStatus === 'OVERDUE'

          return (
            <div
              key={obj.id}
              onClick={() => setSelectedObj(obj)}
              style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-105 z-20"
            >
              {/* Pulsing reticle */}
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                  isOverdue
                    ? 'border-amber-400 bg-amber-500/20'
                    : 'border-emerald-400 bg-emerald-500/20'
                } ${isSelected ? 'ring-4 ring-blue-400' : ''}`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${isOverdue ? 'bg-amber-400' : 'bg-emerald-400'}`}
                />
              </div>

              {/* In-world spatial HUD Card */}
              <div className="mt-2 -ml-20 w-44 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-700 text-white text-[11px] shadow-lg font-sans">
                <div className="font-bold text-slate-200 uppercase tracking-tight truncate">
                  {obj.category}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mb-1">{obj.tag}</div>

                <div className="space-y-0.5 text-[10px] border-t border-slate-800 pt-1">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Check className="w-3 h-3" />
                    <span>Registered in Govt DB</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Check className="w-3 h-3" />
                    <span>Geo-Fenced to Centre</span>
                  </div>
                  {isOverdue ? (
                    <div className="flex items-center gap-1 text-amber-400 font-semibold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Maintenance Overdue</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Check className="w-3 h-3" />
                      <span>Maintenance Compliant</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Bottom instructions */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-800">
          <span>Tap any reticle to inspect component specs</span>
          <span>WebXR Session Ready (Compatible with WebRTC & Phone Viewport)</span>
        </div>
      </div>

      {/* Snapshot notification */}
      {snapshotTaken && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              AR Audit Frame captured with geo-location metadata & cryptographic signature.
            </span>
          </div>
          <button
            onClick={() => setSnapshotTaken(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
