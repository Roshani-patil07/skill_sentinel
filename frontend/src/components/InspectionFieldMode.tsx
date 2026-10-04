import React, { useState } from 'react'
import {
  Camera, ShieldCheck, MapPin, QrCode, CheckCircle2, AlertTriangle,
  Upload, FileCheck, ScanLine, Loader2
} from 'lucide-react'
import { useSentinelStore } from '../store/useSentinelStore'

export const InspectionFieldMode: React.FC = () => {
  const { selectedCentreId, centres } = useSentinelStore()
  const centre = centres.find((c) => c.id === selectedCentreId) || centres[0]

  const [activeStep, setActiveStep] = useState<'GPS' | 'SCAN_AR' | 'EVIDENCE' | 'REPORT'>('SCAN_AR')
  const [scannedAsset, setScannedAsset] = useState<string | null>(null)
  const [evidenceUploaded, setEvidenceUploaded] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [officerNotes, setOfficerNotes] = useState(
    'Conducted physical inspection of Lab 101. Found 12 students active vs 28 registered. 3 lab workstations missing from inventory.'
  )
  const [submittedReport, setSubmittedReport] = useState(false)

  const handleSimulateScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setScannedAsset('OKH-PC-2026-004')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Officer Header Card */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-xs border border-emerald-800">
              OFFICER MODE
            </span>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Field Inspection & AR/QR Audit Suite
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Target: <strong>{centre?.name}</strong> ({centre?.centre_code}) • Assigned Officer: Inspector Rakesh Gupta
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 bg-gray-900 p-1.5 rounded-lg border border-gray-800 text-xs font-semibold">
          <button
            onClick={() => setActiveStep('GPS')}
            className={`px-3 py-1 rounded transition-colors ${
              activeStep === 'GPS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-gray-400'
            }`}
          >
            1. GPS Geofence
          </button>
          <button
            onClick={() => setActiveStep('SCAN_AR')}
            className={`px-3 py-1 rounded transition-colors ${
              activeStep === 'SCAN_AR' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-gray-400'
            }`}
          >
            2. AR/QR Scan
          </button>
          <button
            onClick={() => setActiveStep('EVIDENCE')}
            className={`px-3 py-1 rounded transition-colors ${
              activeStep === 'EVIDENCE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-gray-400'
            }`}
          >
            3. Privacy Evidence
          </button>
          <button
            onClick={() => setActiveStep('REPORT')}
            className={`px-3 py-1 rounded transition-colors ${
              activeStep === 'REPORT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-gray-400'
            }`}
          >
            4. Submit Dossier
          </button>
        </div>
      </div>

      {/* Step 1: GPS Geofence Verification */}
      {activeStep === 'GPS' && (
        <div className="glass-panel p-6 rounded-xl border border-gray-800 max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <MapPin className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Premises Geofence Verification
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Inspection protocol enforces location validation before audit tokens can be signed.
          </p>

          <div className="bg-gray-900/90 p-4 rounded-lg border border-gray-800 font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Device Coordinates:</span>
              <span className="text-emerald-400 font-bold">28.5355° N, 77.2690° E</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Centre Registered Coordinates:</span>
              <span className="text-gray-200">28.5355° N, 77.2690° E</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Geofence Boundary Delta:</span>
              <span className="text-emerald-400 font-bold">3.2 meters (INSIDE PERIMETER)</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Geofence authenticated. Officer is physically present on sanctioned premises.</span>
          </div>

          <button
            onClick={() => setActiveStep('SCAN_AR')}
            className="w-full py-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 text-xs font-bold transition-all shadow-glow-green"
          >
            Proceed to Equipment AR/QR Scanner →
          </button>
        </div>
      )}

      {/* Step 2: AR / QR Viewfinder */}
      {activeStep === 'SCAN_AR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-gray-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span className="font-bold flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Live Camera AR Viewfinder (Rear Sensor)
              </span>
              <span className="font-mono text-emerald-400">FPS: 30 • Exposure: Auto</span>
            </div>

            {/* Simulated AR Viewfinder Canvas */}
            <div className="relative w-full aspect-video bg-gray-950 rounded-lg border border-gray-800 overflow-hidden flex items-center justify-center">
              {/* Grid and crosshairs */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#00000088)]"></div>

              {/* AR Reticle */}
              <div className="relative w-48 h-48 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center animate-pulse">
                <div className="w-12 h-12 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0"></div>
                <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0"></div>
                <div className="w-12 h-12 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0"></div>
                <div className="w-12 h-12 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0"></div>
                
                {isScanning ? (
                  <div className="flex flex-col items-center gap-2 font-mono text-xs text-emerald-400">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    <span>DECRYPTING QR...</span>
                  </div>
                ) : (
                  <div className="text-center font-mono text-[11px] text-emerald-400/90">
                    ALIGN EQUIPMENT QR
                  </div>
                )}

                {/* Laser scan line */}
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-1/2 -translate-y-1/2 animate-pulse"></div>
              </div>

              {/* Scanned Badge */}
              {scannedAsset && (
                <div className="absolute bottom-4 left-4 right-4 bg-emerald-950/95 border border-emerald-700 p-3 rounded-lg text-xs font-mono text-emerald-200 flex items-center justify-between shadow-2xl">
                  <div>
                    <div className="font-bold text-white">CRYPTOGRAPHIC MATCH: {scannedAsset}</div>
                    <div className="text-[10px] text-emerald-400">HMAC-SHA256 Signature Verified • Lat: 28.5355°</div>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-900 text-emerald-300 font-bold text-[10px]">
                    VERIFIED ✓
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="px-4 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-200 text-xs font-bold border border-emerald-700 flex items-center gap-2 shadow-glow-green"
              >
                <ScanLine className="w-4 h-4 text-emerald-400" />
                Scan Equipment QR Code
              </button>
              <button
                onClick={() => setActiveStep('EVIDENCE')}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold border border-gray-700"
              >
                Next: Capture Evidence →
              </button>
            </div>
          </div>

          {/* Asset Verification Progress */}
          <div className="glass-panel p-5 rounded-xl border border-gray-800 space-y-4">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Lab Equipment Checklist
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-gray-900 border border-gray-800 flex justify-between items-center">
                <span>OKH-PC-2026-001 (Dell OptiPlex)</span>
                <span className="text-emerald-400 font-bold">Verified ✓</span>
              </div>
              <div className="p-2.5 rounded bg-gray-900 border border-gray-800 flex justify-between items-center">
                <span>OKH-PC-2026-002 (Dell OptiPlex)</span>
                <span className="text-emerald-400 font-bold">Verified ✓</span>
              </div>
              <div className="p-2.5 rounded bg-red-950/60 border border-red-800 flex justify-between items-center">
                <span>OKH-PC-2026-004 (Dell OptiPlex)</span>
                <span className={scannedAsset ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {scannedAsset ? 'Verified ✓' : 'FLAGGED MISSING'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-gray-900 border border-gray-800 flex justify-between items-center">
                <span>OKH-BIO-2026-001 (Biometric Kiosk)</span>
                <span className="text-emerald-400 font-bold">Verified ✓</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Privacy Preserving Evidence Capture */}
      {activeStep === 'EVIDENCE' && (
        <div className="glass-panel p-6 rounded-xl border border-gray-800 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Privacy-Preserving Physical Evidence Capture
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Per <strong>docs/privacy.md</strong>, any classroom photo taken for audit evidence is automatically passed through an edge Gaussian blur filter to protect trainee biometric privacy while preserving verifiable physical equipment proof.
          </p>

          {/* Evidence Frame Preview with Face Blurring Simulation */}
          <div className="relative w-full aspect-video bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
            <div className="text-center space-y-2 p-6">
              <Camera className="w-10 h-10 text-gray-500 mx-auto" />
              <div className="text-xs font-semibold text-gray-300">
                {evidenceUploaded ? 'Evidence Photo Masked & Encrypted (AES-256-GCM)' : 'No Photo Captured Yet'}
              </div>
              <p className="text-[11px] text-gray-500 max-w-md">
                Automatic edge blur filter applied to all human faces before upload to immutable evidence vault.
              </p>
            </div>
            {evidenceUploaded && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] border border-emerald-800">
                BLUR APPLIED • SHA-256: e3b0c442...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setEvidenceUploaded(true)}
              className="px-4 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-200 text-xs font-bold border border-emerald-700 flex items-center gap-2 shadow-glow-green"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              Capture & Privacy-Mask Room Evidence
            </button>
            <button
              onClick={() => setActiveStep('REPORT')}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold border border-gray-700"
            >
              Next: Finalize Audit Report →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Finalize & Submit Report */}
      {activeStep === 'REPORT' && (
        <div className="glass-panel p-6 rounded-xl border border-gray-800 max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <FileCheck className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Statutory Field Inspection Findings Dossier
            </h3>
          </div>

          {submittedReport ? (
            <div className="p-6 text-center space-y-2 bg-emerald-950/40 border border-emerald-800 rounded-lg">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-sm font-bold text-white">Inspection Dossier Cryptographically Sealed</h4>
              <p className="text-xs text-gray-300">
                Findings logged into immutable government audit trail. WhatsApp notification delivered to State Mission Director.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Officer Detailed Field Findings & Remarks
                </label>
                <textarea
                  rows={4}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-800 font-mono space-y-1 text-[11px]">
                <div>Inspector: Rakesh Gupta (ID: INSP-DEL-04)</div>
                <div>Timestamp: {new Date().toLocaleString()}</div>
                <div>Status: PENDING STATUTORY SUBMISSION</div>
              </div>

              <button
                onClick={() => setSubmittedReport(true)}
                className="w-full py-2.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-200 text-xs font-bold border border-red-800 shadow-glow-red transition-all"
              >
                Sign & Submit Inspection Dossier
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
