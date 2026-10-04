import React, { useState, useEffect } from 'react'
import {
  Send, AlertOctagon, CheckCircle2, Clock, User,
  FileText, Plus, Filter, ArrowRight, ShieldAlert
} from 'lucide-react'
import { DataTable, Column } from '../components/ui/DataTable'
import { StatusBadge } from '../components/ui/StatusBadge'
import { FilterBar, FilterConfig } from '../components/ui/FilterBar'
import { MetricCard } from '../components/ui/MetricCard'
import { Drawer } from '../components/ui/Drawer'
import { LoadingState } from '../components/ui/LoadingState'
import { useSentinelStore } from '../store/useSentinelStore'
import { MOCK_INTERVENTIONS } from '../data/mockData'

interface InterventionItem {
  id: string
  centre_id: string
  centre_code: string
  centre_name: string
  intervention_type: string
  priority: string
  reason: string
  owner: string
  deadline: string
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED' | string
  evidence_hash?: string
}

export const InterventionsPage: React.FC = () => {
  const { centres, setToast } = useSentinelStore()
  const [interventions, setInterventions] = useState<any[]>(MOCK_INTERVENTIONS)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedIntervention, setSelectedIntervention] = useState<any | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Fetch interventions from backend
  const fetchInterventions = async () => {
    try {
      const res = await fetch('/api/v1/interventions')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setInterventions(data)
      } else {
        setInterventions(MOCK_INTERVENTIONS)
      }
    } catch (e) {
      console.warn('Interventions API offline, using local mock cases:', e)
      setInterventions(MOCK_INTERVENTIONS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInterventions()
  }, [])

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedIntervention) return
    try {
      await fetch(`/api/v1/interventions/${selectedIntervention.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setInterventions((prev) =>
        prev.map((item) =>
          item.id === selectedIntervention.id ? { ...item, status: newStatus } : item
        )
      )
      setToast({
        id: Math.random().toString(),
        title: `Intervention ${selectedIntervention.id} updated to ${newStatus}`,
        severity: 'SUCCESS',
      })
      setDrawerOpen(false)
    } catch (e) {
      console.error(e)
    }
  }

  const filteredInterventions = interventions.filter(
    (i) => statusFilter === 'ALL' || i.status === statusFilter
  )

  const columns: Column<InterventionItem>[] = [
    {
      key: 'priority',
      header: 'Priority',
      width: '110px',
      sortable: true,
      render: (row) => <StatusBadge status={row.priority} />,
    },
    {
      key: 'centre_name',
      header: 'Centre & Code',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.centre_name}</div>
          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
            {row.centre_code}
          </span>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason / AI Recommendation',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 text-xs block">
            {row.intervention_type.replace(/_/g, ' ')}
          </span>
          <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">{row.reason}</p>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-slate-400" />
          {row.owner}
        </span>
      ),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {row.deadline}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setSelectedIntervention(row)
            setDrawerOpen(true)
          }}
          className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-blue-900 border border-slate-300 font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
        >
          <span>Manage</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      ),
    },
  ]

  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Statuses', value: 'ALL' },
        { label: 'Open', value: 'OPEN' },
        { label: 'Assigned', value: 'ASSIGNED' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Escalated', value: 'ESCALATED' },
        { label: 'Resolved', value: 'RESOLVED' },
      ],
    },
  ]

  if (loading) {
    return <LoadingState message="Loading preventive intervention queue..." />
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Preventive Actions
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Intervention Command Centre
          </h1>
        </div>
      </div>

      {/* Row 1: Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <MetricCard label="Active Interventions" value={interventions.length} variant="navy" />
        <MetricCard
          label="Critical / Escalated"
          value={interventions.filter((i) => i.priority === 'CRITICAL' || i.status === 'ESCALATED').length}
          variant="critical"
        />
        <MetricCard
          label="In Progress"
          value={interventions.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length}
          variant="warning"
        />
        <MetricCard
          label="Resolved Today"
          value={interventions.filter((i) => i.status === 'RESOLVED').length}
          variant="healthy"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onReset={() => setStatusFilter('ALL')} />

      {/* Interventions Table */}
      <DataTable
        columns={columns}
        data={filteredInterventions}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => {
          setSelectedIntervention(item)
          setDrawerOpen(true)
        }}
        pageSize={10}
      />

      {/* Action Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedIntervention?.intervention_type.replace(/_/g, ' ') || 'Intervention Details'}
        subtitle={selectedIntervention?.centre_name}
        footer={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdateStatus('IN_PROGRESS')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              Mark In Progress
            </button>
            <button
              onClick={() => handleUpdateStatus('RESOLVED')}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
            >
              Resolve Intervention
            </button>
          </div>
        }
      >
        {selectedIntervention && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-500">Current Status:</span>
              <StatusBadge status={selectedIntervention.status} />
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Reason / AI Trigger Signal:</span>
              <p className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-medium">
                {selectedIntervention.reason}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Assigned Officer</span>
                <span className="font-bold text-slate-900 mt-1 block">{selectedIntervention.owner}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Resolution Deadline</span>
                <span className="font-bold text-slate-900 mt-1 block">{selectedIntervention.deadline}</span>
              </div>
            </div>

            {selectedIntervention.evidence_hash && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">Cryptographic Evidence Signature:</span>
                <div className="p-2.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-600 break-all select-all">
                  SHA256: {selectedIntervention.evidence_hash}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
