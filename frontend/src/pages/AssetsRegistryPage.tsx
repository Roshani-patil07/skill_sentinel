import React, { useState, useEffect } from 'react'
import {
  Database, Search as SearchIcon, HardDrive, CheckCircle2,
  AlertTriangle, QrCode, Filter, Download
} from 'lucide-react'
import { DataTable, Column } from '../components/ui/DataTable'
import { StatusBadge } from '../components/ui/StatusBadge'
import { FilterBar, FilterConfig } from '../components/ui/FilterBar'
import { Search } from '../components/ui/Search'
import { LoadingState } from '../components/ui/LoadingState'
import { MOCK_ASSETS } from '../data/mockData'

interface AssetRecord {
  id: string
  asset_tag: string
  model_name: string
  category: string
  centre_name: string
  centre_code: string
  status: 'VERIFIED_PRESENT' | 'MISSING' | 'TAMPERED' | string
  last_verified: string
  qr_code: string
}

export const AssetsRegistryPage: React.FC = () => {
  const defaultAssets = MOCK_ASSETS.map((a) => ({
    id: a.id,
    asset_tag: a.asset_tag,
    model_name: a.name,
    category: a.category,
    centre_name: a.centre_name,
    centre_code: a.centre_id,
    status: a.status === 'VERIFIED' ? 'VERIFIED_PRESENT' : a.status === 'MISSING' ? 'MISSING' : 'TAMPERED',
    last_verified: a.last_verified_at,
    qr_code: a.qr_code,
  }))

  const [assets, setAssets] = useState<AssetRecord[]>(defaultAssets)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/v1/assets')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setAssets(data)
      } else {
        setAssets(defaultAssets)
      }
    } catch (e) {
      console.warn('Assets API offline, using local mock registry:', e)
      setAssets(defaultAssets)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      a.asset_tag.toLowerCase().includes(search.toLowerCase()) ||
      a.model_name.toLowerCase().includes(search.toLowerCase()) ||
      a.centre_name.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())

    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const columns: Column<AssetRecord>[] = [
    {
      key: 'asset_tag',
      header: 'Asset Tag',
      sortable: true,
      width: '150px',
      render: (row) => (
        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {row.asset_tag}
        </span>
      ),
    },
    {
      key: 'model_name',
      header: 'Model & Category',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.model_name}</div>
          <div className="text-[11px] text-slate-500 font-mono">{row.category}</div>
        </div>
      ),
    },
    {
      key: 'centre_name',
      header: 'Assigned Centre',
      sortable: true,
      render: (row) => (
        <div>
          <div className="text-slate-800 font-medium">{row.centre_name}</div>
          <div className="text-[10px] font-mono text-slate-400">{row.centre_code}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Verification State',
      align: 'center',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'last_verified',
      header: 'Last Audit',
      sortable: true,
      render: (row) => <span className="font-mono text-slate-600 text-xs">{row.last_verified}</span>,
    },
  ]

  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Equipment', value: 'ALL' },
        { label: 'Verified Present', value: 'VERIFIED_PRESENT' },
        { label: 'Missing Deficit', value: 'MISSING' },
        { label: 'Tampered / Unregistered', value: 'TAMPERED' },
      ],
    },
  ]

  if (loading) {
    return <LoadingState message="Syncing National Asset Inventory Registry..." />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Infrastructure Registry
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Sanctioned Asset Database
          </h1>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <Search value={search} onChange={setSearch} placeholder="Search by tag, model, centre..." />
        </div>
        <div className="md:col-span-2">
          <FilterBar filters={filters} onReset={() => setStatusFilter('ALL')} />
        </div>
      </div>

      {/* Asset Table */}
      <DataTable
        columns={columns}
        data={filteredAssets}
        keyExtractor={(item) => item.id}
        pageSize={10}
      />
    </div>
  )
}
