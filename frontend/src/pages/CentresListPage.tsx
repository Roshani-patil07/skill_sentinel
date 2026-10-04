import React, { useState, useEffect } from 'react'
import { Building2, Search as SearchIcon, Download, Eye, Plus, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DataTable, Column } from '../components/ui/DataTable'
import { RiskBadge } from '../components/ui/RiskBadge'
import { FilterBar, FilterConfig } from '../components/ui/FilterBar'
import { Search } from '../components/ui/Search'
import { LoadingState } from '../components/ui/LoadingState'
import { useSentinelStore, TrainingCentreItem } from '../store/useSentinelStore'

export const CentresListPage: React.FC = () => {
  const navigate = useNavigate()
  const { centres, setCentres, setSelectedCentreId } = useSentinelStore()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState('ALL')
  const [riskFilter, setRiskFilter] = useState('ALL')

  useEffect(() => {
    if (centres.length === 0) {
      setLoading(true)
      fetch('/api/v1/centres')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setCentres(data)
        })
        .finally(() => setLoading(false))
    }
  }, [centres.length, setCentres])

  const states = Array.from(new Set(centres.map((c) => c.state_name).filter(Boolean)))

  const filteredCentres = centres.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.centre_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesState = stateFilter === 'ALL' || c.state_name === stateFilter
    const matchesRisk = riskFilter === 'ALL' || c.current_risk_level === riskFilter

    return matchesSearch && matchesState && matchesRisk
  })

  const columns: Column<TrainingCentreItem>[] = [
    {
      key: 'centre_code',
      header: 'Centre Code',
      sortable: true,
      width: '120px',
      render: (row) => (
        <span className="font-mono font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          {row.centre_code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Centre Name & Location',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-[11px] text-slate-500">
            {row.district_name}, {row.state_name}
          </div>
        </div>
      ),
    },
    {
      key: 'active_cameras',
      header: 'Active Cameras',
      align: 'center',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-semibold text-slate-700">
          {row.active_cameras || 2} Feeds
        </span>
      ),
    },
    {
      key: 'total_assets',
      header: 'Sanctioned Assets',
      align: 'center',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-semibold text-slate-700">
          {row.total_assets || 26} Units
        </span>
      ),
    },
    {
      key: 'current_risk_score',
      header: 'Compliance Risk',
      align: 'center',
      sortable: true,
      render: (row) => (
        <RiskBadge score={row.current_risk_score} level={row.current_risk_level} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setSelectedCentreId(row.id)
            navigate(`/centres/${row.id}`)
          }}
          className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-blue-900 border border-slate-300 font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Audit</span>
        </button>
      ),
    },
  ]

  const filters: FilterConfig[] = [
    {
      key: 'state',
      label: 'State',
      value: stateFilter,
      onChange: setStateFilter,
      options: [
        { label: 'All States', value: 'ALL' },
        ...states.map((s) => ({ label: s, value: s })),
      ],
    },
    {
      key: 'risk',
      label: 'Risk Level',
      value: riskFilter,
      onChange: setRiskFilter,
      options: [
        { label: 'All Levels', value: 'ALL' },
        { label: 'Critical', value: 'CRITICAL' },
        { label: 'High', value: 'HIGH' },
        { label: 'Moderate', value: 'MODERATE' },
        { label: 'Low', value: 'LOW' },
      ],
    },
  ]

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Code,Name,District,State,RiskScore,RiskLevel']
        .concat(
          filteredCentres.map(
            (c) =>
              `${c.centre_code},"${c.name}",${c.district_name},${c.state_name},${c.current_risk_score},${c.current_risk_level}`
          )
        )
        .join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'skill_sentinel_centres.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <LoadingState message="Loading training centres directory..." />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            National Directory
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Registered Training Centres
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by code, centre, district..."
          />
        </div>
        <div className="md:col-span-2">
          <FilterBar
            filters={filters}
            onReset={() => {
              setStateFilter('ALL')
              setRiskFilter('ALL')
              setSearchQuery('')
            }}
          />
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredCentres}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => {
          setSelectedCentreId(item.id)
          navigate(`/centres/${item.id}`)
        }}
        pageSize={10}
      />
    </div>
  )
}
