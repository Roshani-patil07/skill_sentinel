import React, { useState } from 'react'
import {
  QrCode, CheckCircle2, AlertTriangle, ShieldCheck,
  HardDrive, Calendar, MapPin, Camera, Sparkles, Check,
  AlertOctagon, Loader2
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useSentinelStore } from '../store/useSentinelStore'

interface AssetVerificationDetail {
  asset_tag: string
  model_name: string
  specification: string
  assigned_centre: string
  geo_verified: boolean
  ai_vision_verified: boolean
  maintenance_status: 'CURRENT' | 'OVERDUE'
  next_maintenance_date: string
  previous_inspection: string
  evidence_signature: string
}

export const QRInspectionPage: React.FC = () => {
  const { selectedCentreId, setToast, updateCentreRisk } = useSentinelStore()

  const [scanning, setScanning] = useState(false)
  const [scannedAsset, setScannedAsset] = useState<AssetVerificationDetail | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)

  const handleSimulateScan = (tag: string, isOverdue: boolean = false) => {
    setScanning(true)
    setScannedAsset(null)
    setVerificationSuccess(false)

    setTimeout(() => {
      setScanning(false)
      setScannedAsset({
        asset_tag: tag,
        model_name: tag.includes('CNC') ? 'Haas VF-2 CNC Milling Centre' : 'Dell OptiPlex 7090 Tower',
        specification: tag.includes('CNC') ? '4-Axis CNC with Fanuc 0i-MF Control' : 'Intel Core i7-11700, 32GB RAM, 1TB SSD',
        assigned_centre: 'PMKK Okhla Industrial Skill Hub (DEL-OKH-042)',
        geo_verified: true,
        ai_vision_verified: true,
        maintenance_status: isOverdue ? 'OVERDUE' : 'CURRENT',
        next_maintenance_date: isOverdue ? 'Expired (Sept 15, 2026)' : 'Nov 20, 2026',
        previous_inspection: 'Aug 14, 2026 by Auditor P. Verma (Verified)',
        evidence_signature: '7e2b19cf4d5a0c8b3291847e6a1f05e9d8c7b6a50412389abcdef1234567890a',
      })
    }, 1200)
  }

  const handleMarkVerified = async () => {
    if (!scannedAsset) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/v1/qr/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: scannedAsset.asset_tag,
          qr_signature: scannedAsset.evidence_signature,
          latitude: 28.5355,
          longitude: 77.2750,
          inspection_id: 'insp-ar-01',
        }),
      })

      const data = await res.json()
      setVerificationSuccess(true)
      setToast({
        id: Math.random().toString(),
        title: `Asset ${scannedAsset.asset_tag} Cryptographically Verified!`,
        message: 'Status logged in National Asset Registry.',
        severity: 'SUCCESS',
      })

      if (data.new_centre_risk !== undefined) {
        updateCentreRisk(selectedCentreId, data.new_centre_risk, 'LOW')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Mobile-First Asset Audit
        </span>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          QR Asset Inspector
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan machine QR code for dual cryptographic & AI visual cross-verification
        </p>
      </div>

      {/* QR Scanner Viewfinder Card */}
      <div className="bg-slate-900 rounded-xl p-6 text-white text-center relative overflow-hidden border border-slate-800 shadow-gov-md">
        {/* Reticle Viewfinder */}
        <div className="w-56 h-56 mx-auto border-2 border-dashed border-blue-400/70 rounded-2xl relative flex items-center justify-center p-4 bg-slate-950/60">
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400" />

          {scanning ? (
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
              <span className="text-xs font-mono text-blue-300">Decoding QR Hash...</span>
            </div>
          ) : (
            <div className="text-center">
              <QrCode className="w-12 h-12 text-slate-500 mx-auto mb-2 opacity-60" />
              <span className="text-xs text-slate-400 block font-sans">
                Point camera at equipment QR code
              </span>
            </div>
          )}

          {/* Animated laser line */}
          {scanning && (
            <div className="absolute inset-x-2 h-0.5 bg-blue-400 shadow-glow-green animate-bounce" />
          )}
        </div>

        {/* Quick Simulation Scan Triggers */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block mb-2">
            Simulate Physical Equipment Scans
          </span>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => handleSimulateScan('OKH-PC-2026-004')}
              disabled={scanning}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Scan Dell PC Workstation
            </button>
            <button
              onClick={() => handleSimulateScan('OKH-CNC-2026-001')}
              disabled={scanning}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Scan CNC Machine
            </button>
            <button
              onClick={() => handleSimulateScan('OKH-WLD-2026-002', true)}
              disabled={scanning}
              className="px-2.5 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 text-xs font-semibold border border-amber-700 transition-colors"
            >
              Scan Overdue Simulator
            </button>
          </div>
        </div>
      </div>

      {/* Scanned Verification Detail Flow */}
      {scannedAsset && (
        <Card
          title={
            <div className="flex items-center justify-between">
              <span>{scannedAsset.asset_tag}</span>
              <StatusBadge
                status={scannedAsset.maintenance_status === 'OVERDUE' ? 'WARNING' : 'HEALTHY'}
              />
            </div>
          }
          subtitle={scannedAsset.model_name}
        >
          <div className="space-y-3.5 text-xs">
            {/* Step 1: Asset Details */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-800 block">Sanctioned Specifications:</span>
              <p className="text-slate-600 font-mono text-[11px] mt-0.5">{scannedAsset.specification}</p>
            </div>

            {/* Step 2: Centre Geo Verification */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white">
              <div className="p-1 rounded bg-emerald-50 text-emerald-600 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Geo-Fenced Centre Assignment: Verified</span>
                <span className="text-[11px] text-slate-500">{scannedAsset.assigned_centre}</span>
              </div>
            </div>

            {/* Step 3: AI Visual Verification */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white">
              <div className="p-1 rounded bg-blue-50 text-blue-900 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">AI Vision Cross-Check: Matched</span>
                <span className="text-[11px] text-slate-500">
                  YOLO-Edge detected same equipment in active practical room frame.
                </span>
              </div>
            </div>

            {/* Step 4: Maintenance Status */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white">
              <div
                className={`p-1 rounded mt-0.5 ${
                  scannedAsset.maintenance_status === 'OVERDUE'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {scannedAsset.maintenance_status === 'OVERDUE' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Calendar className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  Maintenance Schedule: {scannedAsset.maintenance_status}
                </span>
                <span className="text-[11px] text-slate-500">
                  Next Maintenance: {scannedAsset.next_maintenance_date}
                </span>
              </div>
            </div>

            {/* Step 5: Previous Inspection */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-600">
              <span className="font-bold text-slate-700 block mb-0.5">Previous Inspection:</span>
              <span>{scannedAsset.previous_inspection}</span>
            </div>

            {/* Step 6: Evidence Signature */}
            <div className="p-2.5 rounded bg-slate-100 font-mono text-[10px] text-slate-500 break-all select-all">
              Evidence Hash: SHA256({scannedAsset.evidence_signature})
            </div>

            {/* Step 7: Mark Verified Action Button */}
            <div className="pt-2">
              {verificationSuccess ? (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-center font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Asset Verified & Recorded in Central Registry</span>
                </div>
              ) : (
                <button
                  onClick={handleMarkVerified}
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Mark Physical Asset Verified</span>
                </button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
