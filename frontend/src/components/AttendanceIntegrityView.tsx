import React, { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Search, Filter, ShieldAlert } from 'lucide-react'
import { DiscrepancyItem, useSentinelStore } from '../store/useSentinelStore'

export const AttendanceIntegrityView: React.FC = () => {
  const { discrepancies, setDiscrepancies, setSelectedCentreId, setActiveTab } = useSentinelStore()
  const [filterSeverity, setFilterSeverity] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchDiscrepancies = async () => {
    try {
      const res = await fetch('/api/v1/attendance/discrepancies')
      const data = await res.json()
      setDiscrepancies(data)
    } catch (err) {
      console.error('Failed to load discrepancies:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscrepancies()
  }, [])

  const filtered = discrepancies.filter((d) => {
    if (filterSeverity !== 'ALL' && d.severity !== filterSeverity) return false
    if (
      search &&
      !d.centre_name.toLowerCase().includes(search.toLowerCase()) &&
      !d.centre_code.toLowerCase().includes(search.toLowerCase()) &&
      !d.batch_code.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Attendance Integrity & Discrepancy Intelligence
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Continuous cross-verification between Biometric Portal Logs and Non-Biometric Camera Headcounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search centre, batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 sm:w-60"
            />
          </div>

          {/* Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MODERATE">Moderate Only</option>
          </select>
        </div>
      </div>

      {/* Discrepancy Table */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Centre & Code</th>
                <th className="py-3 px-4">Batch & Course</th>
                <th className="py-3 px-4 text-center">Sanctioned</th>
                <th className="py-3 px-4 text-center">Biometric Claimed</th>
                <th className="py-3 px-4 text-center">Vision Headcount</th>
                <th className="py-3 px-4 text-center">Discrepancy</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {filtered.map((item) => {
                const isCrit = item.severity === 'CRITICAL'
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-800/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedCentreId(item.centre_id)
                      setActiveTab('LIVE_CAMERA')
                    }}
                  >
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-white">{item.centre_name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{item.centre_code}</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-medium text-gray-200">{item.batch_code}</div>
                      <div className="text-[11px] text-gray-400">{item.course_title}</div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400 font-bold">{item.sanctioned_strength}</td>
                    <td className="py-3 px-4 text-center text-gray-200 font-bold">{item.reported_attendance}</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold text-sm">
                      {item.observed_headcount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-red-400 font-bold">
                        {item.discrepancy_percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCrit
                            ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCentreId(item.centre_id)
                          setActiveTab('LIVE_CAMERA')
                        }}
                        className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-emerald-300 border border-gray-700 transition-colors"
                      >
                        Inspect Feed
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400 font-sans">
                    No matching attendance discrepancies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
