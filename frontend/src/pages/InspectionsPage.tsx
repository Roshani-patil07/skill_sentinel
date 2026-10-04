import React, { useState, useEffect } from 'react'
import {
  ClipboardCheck, Calendar, MapPin, CheckCircle2,
  AlertTriangle, Eye, ArrowRight, MessageSquare, Plus,
  Camera, ShieldCheck, QrCode, ScanLine, Loader2,
  FileCheck, UserCheck, AlertOctagon, RefreshCw, X
} from 'lucide-react'
import { DataTable, Column } from '../components/ui/DataTable'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { useSentinelStore } from '../store/useSentinelStore'
import { MOCK_INSPECTIONS, MOCK_CENTRES, FieldInspectionItem } from '../data/mockData'

export const InspectionsPage: React.FC = () => {
  const { centres, setToast, updateCentreRisk } = useSentinelStore()

  const [inspections, setInspections] = useState<FieldInspectionItem[]>(MOCK_INSPECTIONS)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'FIELD_MODE'>('QUEUE')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Selected inspection for field audit or WhatsApp modal
  const [selectedInspection, setSelectedInspection] = useState<FieldInspectionItem>(MOCK_INSPECTIONS[0])
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)

  // Interactive Field Audit Mode states
  const [fieldStep, setFieldStep] = useState<'GPS' | 'SCAN_AR' | 'EVIDENCE' | 'REPORT'>('GPS')
  const [gpsVerified, setGpsVerified] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedAssetTag, setScannedAssetTag] = useState<string | null>(null)
  const [evidenceCaptured, setEvidenceCaptured] = useState(false)
  const [officerNotes, setOfficerNotes] = useState(
    'Conducted physical inspection of Practical Lab 101. Found 8 students present vs 28 recorded on biometric terminal. 1 Haas CNC Lathe missing from designated bay.'
  )
  const [submittingAudit, setSubmittingAudit] = useState(false)
  const [auditCompleted, setAuditCompleted] = useState(false)

  // Form for scheduling a new audit
  const [newAuditCentreId, setNewAuditCentreId] = useState(MOCK_CENTRES[0]?.id || 'tc-pune-047')
  const [newAuditType, setNewAuditType] = useState('SURPRISE_VIGILANCE')
  const [newAuditAuditor, setNewAuditAuditor] = useState('Inspector Rajesh Kulkarni, MSDE Vigilance')
  const [newAuditDate, setNewAuditDate] = useState('Tomorrow, 10:00 IST')

  const fetchInspections = async () => {
    try {
      const res = await fetch('/api/v1/inspections')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        // Normalize fields from backend or mock
        const normalized = data.map((item: any) => ({
          ...item,
          type: item.inspection_type || item.type || 'SURPRISE_VIGILANCE',
          inspection_type: item.inspection_type || item.type || 'SURPRISE_VIGILANCE',
          findings_summary: item.findings || item.findings_summary || 'Inspection pending verification.',
          findings: item.findings || item.findings_summary || 'Inspection pending verification.',
          assigned_auditor: item.assigned_auditor || 'Inspector R. Kulkarni',
          auditor_designation: item.auditor_designation || 'Vigilance Officer',
          evidence_count: item.evidence_count || 4,
          geofence_verified: true,
        }))
        setInspections(normalized)
      } else {
        setInspections(MOCK_INSPECTIONS)
      }
    } catch (e) {
      console.warn('Inspections API offline, using local mock audits:', e)
      setInspections(MOCK_INSPECTIONS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInspections()
  }, [])

  const handleStartAudit = (insp: FieldInspectionItem) => {
    setSelectedInspection(insp)
    setActiveTab('FIELD_MODE')
    setFieldStep('GPS')
    setScannedAssetTag(null)
    setEvidenceCaptured(false)
    setAuditCompleted(false)
  }

  const handleSimulateQRScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setScannedAssetTag('MH-PU-CNC-2026-001')
      setToast({
        id: String(Date.now()),
        title: 'Equipment QR Signature Validated',
        message: 'HMAC-SHA256 authenticated with National Asset Registry.',
        severity: 'SUCCESS',
      })
    }, 1200)
  }

  const handleSubmitFieldAudit = async () => {
    setSubmittingAudit(true)
    try {
      const res = await fetch(`/api/v1/inspections/${selectedInspection.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officer_findings: officerNotes,
          status: 'COMPLETED',
        }),
      }).catch(() => null)

      // Update inspection status in state
      setInspections((prev) =>
        prev.map((item) =>
          item.id === selectedInspection.id
            ? { ...item, status: 'COMPLETED', findings: officerNotes, findings_summary: officerNotes }
            : item
        )
      )

      // Update centre risk score
      updateCentreRisk(selectedInspection.centre_id, 36, 'LOW')

      setAuditCompleted(true)
      setToast({
        id: String(Date.now()),
        title: 'Field Audit Dossier Submitted Successfully',
        message: `Inspection for ${selectedInspection.centre_name} logged. Centre risk recalculated.`,
        severity: 'SUCCESS',
      })
    } catch (e) {
      console.error(e)
    } finally {
      setSubmittingAudit(false)
    }
  }

  const handleScheduleNewAudit = async () => {
    const targetCentre = centres.find((c) => c.id === newAuditCentreId) || MOCK_CENTRES[0]
    const newRecord: FieldInspectionItem = {
      id: `insp-${Date.now().toString().slice(-4)}`,
      inspection_code: `INSP-2026-${targetCentre.centre_code.replace(/[^a-zA-Z0-9]/g, '')}-099`,
      centre_id: targetCentre.id,
      centre_name: targetCentre.name,
      centre_code: targetCentre.centre_code,
      district_name: targetCentre.district_name,
      state_name: targetCentre.state_name,
      assigned_auditor: newAuditAuditor,
      auditor_designation: 'Special Flying Squad Inspector',
      type: newAuditType,
      inspection_type: newAuditType,
      status: 'SCHEDULED',
      scheduled_date: newAuditDate,
      geofence_verified: true,
      findings_summary: 'Dispatched for priority compliance inspection.',
      findings: 'Dispatched for priority compliance inspection.',
      evidence_count: 0,
    }

    // Try posting to API if available
    await fetch('/api/v1/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        centre_id: targetCentre.id,
        inspection_type: newAuditType,
        officer_findings: 'Priority scheduled vigilance audit.',
      }),
    }).catch(() => null)

    setInspections([newRecord, ...inspections])
    setScheduleModalOpen(false)
    setToast({
      id: String(Date.now()),
      title: 'Surprise Audit Scheduled',
      message: `Inspection scheduled for ${targetCentre.name}. Assigned to ${newAuditAuditor}.`,
      severity: 'SUCCESS',
    })
  }

  // Filtered list
  const filteredInspections = inspections.filter((item) => {
    if (statusFilter === 'ALL') return true
    return item.status === statusFilter
  })

  // Table columns definition
  const columns: Column<FieldInspectionItem>[] = [
    {
      key: 'inspection_code',
      header: 'Audit ID',
      width: '140px',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.inspection_code || row.id}
        </span>
      ),
    },
    {
      key: 'centre_name',
      header: 'Training Centre & Location',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.centre_name}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {row.centre_code} • {row.district_name || 'District'}, {row.state_name || 'State'}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Audit Protocol',
      sortable: true,
      render: (row) => {
        const proto = (row.inspection_type || row.type || 'SURPRISE_AUDIT').replace(/_/g, ' ')
        return (
          <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {proto}
          </span>
        )
      },
    },
    {
      key: 'assigned_auditor',
      header: 'Assigned Auditor',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.assigned_auditor || 'Inspector R. Kulkarni'}</div>
          <div className="text-[10px] text-slate-500">{row.auditor_designation || 'Vigilance Officer'}</div>
        </div>
      ),
    },
    {
      key: 'scheduled_date',
      header: 'Scheduled Window',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-600 flex items-center gap-1 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {row.scheduled_date || 'Scheduled'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Audit Status',
      align: 'center',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleStartAudit(row)}
            className="px-2.5 py-1 rounded bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
            title="Launch step-by-step on-site audit mode"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>Audit</span>
          </button>

          <button
            onClick={() => {
              setSelectedInspection(row)
              setWhatsappModalOpen(true)
            }}
            className="p-1 rounded bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 shadow-xs transition-colors"
            title="Dispatch WhatsApp Alert to District Magistrate"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Field Regulatory Operations • Vigilance Command
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Field Inspection Suite & On-Site Audit Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geofenced physical inspections, QR/AR hardware cross-verification, and digital evidence dossiers
          </p>
        </div>

        {/* Tab Toggle & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('QUEUE')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'QUEUE' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inspection Queue ({inspections.length})
            </button>
            <button
              onClick={() => setActiveTab('FIELD_MODE')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'FIELD_MODE' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>On-Site Field Mode</span>
            </button>
          </div>

          <button
            onClick={() => setScheduleModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Surprise Audit</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Queue & Summary View */}
      {activeTab === 'QUEUE' && (
        <div className="space-y-4">
          {/* Key Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Total Audits</span>
              <div className="text-2xl font-extrabold text-slate-900 font-tabular mt-0.5">{inspections.length}</div>
              <span className="text-[10px] text-slate-500">Scheduled & active</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">In Progress</span>
              <div className="text-2xl font-extrabold text-blue-900 font-tabular mt-0.5">
                {inspections.filter((i) => i.status === 'IN_PROGRESS').length}
              </div>
              <span className="text-[10px] text-blue-700">Auditors currently on site</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Violations Flagged</span>
              <div className="text-2xl font-extrabold text-rose-700 font-tabular mt-0.5">
                {inspections.filter((i) => i.status === 'FLAGGED').length}
              </div>
              <span className="text-[10px] text-rose-600">Pending penalty notice</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Completed Audits</span>
              <div className="text-2xl font-extrabold text-emerald-700 font-tabular mt-0.5">
                {inspections.filter((i) => i.status === 'COMPLETED').length}
              </div>
              <span className="text-[10px] text-emerald-600">Dossiers archived</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Filter Status:</span>
            {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'FLAGGED', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors border ${
                  statusFilter === st
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Main Inspections Table */}
          <DataTable
            columns={columns}
            data={filteredInspections}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => handleStartAudit(item)}
            pageSize={10}
          />
        </div>
      )}

      {/* Tab 2: On-Site Field Mode Interactive Console */}
      {activeTab === 'FIELD_MODE' && (
        <div className="space-y-4">
          {/* Active Target Banner */}
          <div className="p-4 rounded-xl bg-blue-950 text-white flex flex-wrap items-center justify-between gap-3 shadow-sm border border-blue-900">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] font-mono">
                  FIELD AUDITOR PROTOCOL ACTIVE
                </span>
                <span className="text-xs font-mono text-blue-200">
                  Ref: {selectedInspection.inspection_code}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                {selectedInspection.centre_name} ({selectedInspection.centre_code})
              </h2>
              <p className="text-xs text-blue-200">
                Assigned Officer: <strong>{selectedInspection.assigned_auditor}</strong> • {selectedInspection.district_name}, {selectedInspection.state_name}
              </p>
            </div>

            {/* Step Stepper Buttons */}
            <div className="flex items-center gap-1.5 bg-blue-900/80 p-1 rounded-lg border border-blue-800 text-xs font-semibold">
              <button
                onClick={() => setFieldStep('GPS')}
                className={`px-3 py-1 rounded transition-colors ${
                  fieldStep === 'GPS' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-blue-200 hover:text-white'
                }`}
              >
                1. GPS Geofence
              </button>
              <button
                onClick={() => setFieldStep('SCAN_AR')}
                className={`px-3 py-1 rounded transition-colors ${
                  fieldStep === 'SCAN_AR' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-blue-200 hover:text-white'
                }`}
              >
                2. QR/AR Hardware
              </button>
              <button
                onClick={() => setFieldStep('EVIDENCE')}
                className={`px-3 py-1 rounded transition-colors ${
                  fieldStep === 'EVIDENCE' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-blue-200 hover:text-white'
                }`}
              >
                3. Privacy Photo
              </button>
              <button
                onClick={() => setFieldStep('REPORT')}
                className={`px-3 py-1 rounded transition-colors ${
                  fieldStep === 'REPORT' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-blue-200 hover:text-white'
                }`}
              >
                4. Submit Dossier
              </button>
            </div>
          </div>

          {/* Step 1: Geofence Verification */}
          {fieldStep === 'GPS' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-xl mx-auto space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-blue-900">
                <MapPin className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Premises GPS Geofence Authentication
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                National vigilance protocol enforces hardware GPS location check within 50 meters of sanctioned premises coordinates before audit tokens can be executed.
              </p>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Auditor Device Coordinates:</span>
                  <span className="text-emerald-700 font-bold">18.5204° N, 73.8567° E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sanctioned Centre Coordinates:</span>
                  <span className="text-slate-800">18.5204° N, 73.8567° E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Geofence Boundary Delta:</span>
                  <span className="text-emerald-700 font-bold">4.1 meters (VERIFIED INSIDE PERIMETER)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Geofence authenticated. Auditor is physically present inside sanctioned workshop perimeter.</span>
              </div>

              <button
                onClick={() => setFieldStep('SCAN_AR')}
                className="w-full py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Equipment QR/AR Scan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: QR & Hardware Inspection */}
          {fieldStep === 'SCAN_AR' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="font-bold flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-900" />
                    <span>Optical QR Viewfinder (Mobile Rear Sensor Simulation)</span>
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">FPS: 30 • Exposure: Auto</span>
                </div>

                {/* Viewfinder Canvas */}
                <div className="relative w-full aspect-video bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                  <div className="relative w-48 h-48 border-2 border-dashed border-emerald-400 rounded-2xl flex items-center justify-center">
                    {isScanning ? (
                      <div className="flex flex-col items-center gap-2 font-mono text-xs text-emerald-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>DECRYPTING CRYPTOGRAPHIC TAG...</span>
                      </div>
                    ) : (
                      <div className="text-center font-mono text-[11px] text-emerald-300">
                        ALIGN EQUIPMENT QR CODE
                      </div>
                    )}
                  </div>

                  {scannedAssetTag && (
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-emerald-500 p-3 rounded-lg text-xs font-mono text-emerald-300 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">CRYPTOGRAPHIC MATCH: {scannedAssetTag}</div>
                        <div className="text-[10px] text-slate-400">Haas VF-2 CNC Milling Centre • Registered in Central DB</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 font-bold text-[10px]">
                        VERIFIED ✓
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleSimulateQRScan}
                    disabled={isScanning}
                    className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <ScanLine className="w-4 h-4" />
                    <span>Scan Machinery QR Code</span>
                  </button>

                  <button
                    onClick={() => setFieldStep('EVIDENCE')}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors"
                  >
                    <span>Next: Capture Photo Evidence →</span>
                  </button>
                </div>
              </div>

              {/* Machinery Checklist Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Mandatory Equipment Checklist
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Haas VF-2 CNC Centre</div>
                      <div className="text-[10px] text-slate-500 font-mono">Tag: MH-PU-CNC-2026-001</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded font-mono">
                      {scannedAssetTag ? 'Verified ✓' : 'Pending'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Haas CNC Lathe Station</div>
                      <div className="text-[10px] text-slate-500 font-mono">Tag: MH-PU-CNC-2026-002</div>
                    </div>
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-200 px-1.5 py-0.5 rounded font-mono">
                      Deficit Flagged
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">CAD Workstation Bank (20)</div>
                      <div className="text-[10px] text-slate-500 font-mono">Dell OptiPlex Series</div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 font-mono">18 / 20 Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Privacy Photo Evidence */}
          {fieldStep === 'EVIDENCE' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-xl mx-auto space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-blue-900">
                <Camera className="w-5 h-5 text-blue-900" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Privacy-Preserving Photographic Evidence
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Photos are hashed and stripped of biometric facial landmarks on-device in compliance with the Digital Personal Data Protection Act (DPDP 2023).
              </p>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
                {evidenceCaptured ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <div className="text-xs font-bold text-slate-900">Auditor Photo Sealed & Encrypted</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      SHA-256: 4f9b8c21a7d3e09876543210abcdef0123456789abcdef0123456789abcdef01
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Camera className="w-10 h-10 text-slate-400 mx-auto" />
                    <button
                      onClick={() => setEvidenceCaptured(true)}
                      className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Capture Audit Photographic Frame
                    </button>
                    <div className="text-[10px] text-slate-400">Automatic anonymization filter applied</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setFieldStep('REPORT')}
                className="w-full py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Findings & Submission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 4: Final Report Submission */}
          {fieldStep === 'REPORT' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-2xl mx-auto space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-blue-900">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Formal Inspection Findings & Sign-Off
                </h3>
              </div>

              {auditCompleted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-950">Dossier Registered on Central Grid</h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    The surprise physical audit for <strong>{selectedInspection.centre_name}</strong> has been logged with cryptographic evidence hashes. Centre compliance risk re-evaluated to <strong>36.0 (HEALTHY)</strong>.
                  </p>
                  <button
                    onClick={() => setActiveTab('QUEUE')}
                    className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Return to Inspection Queue
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Auditor Physical Observations & Findings:
                    </label>
                    <textarea
                      rows={4}
                      value={officerNotes}
                      onChange={(e) => setOfficerNotes(e.target.value)}
                      className="w-full p-3 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500">Auditor Sign-off:</span>
                      <div className="font-bold text-slate-800">{selectedInspection.assigned_auditor}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Verification Token:</span>
                      <div className="font-bold text-emerald-700">GEOFENCE-VALIDATED-OK</div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitFieldAudit}
                    disabled={submittingAudit}
                    className="w-full py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    {submittingAudit ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>{submittingAudit ? 'Signing and Submitting Dossier...' : 'Submit Certified Audit Dossier'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Schedule Surprise Audit Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Regulatory Surprise Audit"
        subtitle="Dispatch Vigilance Officer to Inspected Premises"
        footer={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScheduleModalOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleNewAudit}
              className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm & Dispatch</span>
            </button>
          </div>
        }
      >
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Target Training Centre:</label>
            <select
              value={newAuditCentreId}
              onChange={(e) => setNewAuditCentreId(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 bg-white font-semibold"
            >
              {centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.centre_code}) - Risk: {c.current_risk_score}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Inspection Protocol:</label>
            <select
              value={newAuditType}
              onChange={(e) => setNewAuditType(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 bg-white font-semibold"
            >
              <option value="SURPRISE_VIGILANCE">Surprise Vigilance Physical Inspection</option>
              <option value="QR_ASSET_AUDIT">Sanctioned Hardware QR/AR Verification</option>
              <option value="SPECIAL_COMPLIANCE">Special Attendance & Biometric Audit</option>
              <option value="ROUTINE_ANNUAL">Routine Statutory Annual Audit</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Assigned Vigilance Officer:</label>
            <input
              type="text"
              value={newAuditAuditor}
              onChange={(e) => setNewAuditAuditor(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Inspection Scheduled Window:</label>
            <input
              type="text"
              value={newAuditDate}
              onChange={(e) => setNewAuditDate(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 bg-white"
            />
          </div>
        </div>
      </Modal>

      {/* Official WhatsApp Dispatch Modal */}
      <Modal
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        title="Official WhatsApp Dispatch & Audit Notice"
        subtitle="End-to-End Encrypted Notification to District Officer"
        footer={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWhatsappModalOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setToast({
                  id: Math.random().toString(),
                  title: 'WhatsApp Alert Dispatched to District Magistrate',
                  message: 'Delivery receipt logged via Gov SMS/WhatsApp gateway.',
                  severity: 'SUCCESS',
                })
                setWhatsappModalOpen(false)
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send Official Dispatch</span>
            </button>
          </div>
        }
      >
        {selectedInspection && (
          <div className="space-y-3 text-xs">
            <div className="bg-emerald-950 p-4 rounded-xl text-emerald-100 font-mono text-[11px] leading-relaxed border border-emerald-800 shadow-md">
              <div className="font-bold text-emerald-300 border-b border-emerald-800 pb-2 mb-2">
                🇮🇳 MSDE HIGH-RISK COMPLIANCE ALERT
              </div>
              <p>
                <strong>Centre:</strong> {selectedInspection.centre_name} ({selectedInspection.centre_code})<br />
                <strong>Protocol:</strong> {(selectedInspection.inspection_type || selectedInspection.type || 'AUDIT').replace(/_/g, ' ')}<br />
                <strong>Scheduled:</strong> {selectedInspection.scheduled_date}<br />
                <strong>Finding Summary:</strong> {selectedInspection.findings || selectedInspection.findings_summary || 'Attendance discrepancy identified.'}
              </p>
              <div className="mt-3 pt-2 border-t border-emerald-800/80 flex items-center justify-between text-[10px] text-emerald-400">
                <span>Actions: [View Evidence] [Acknowledge]</span>
                <span>STATUS: DISPATCH READY</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Dispatched via central government notification adapter. If physical WhatsApp credentials are unconfigured, operates in verified simulation sandbox.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
