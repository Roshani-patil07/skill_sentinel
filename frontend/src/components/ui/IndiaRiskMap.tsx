import React, { useState } from 'react'
import { MapPin, ChevronRight, ArrowLeft, ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react'
import { RiskBadge } from './RiskBadge'

interface CentreGeo {
  id: string
  name: string
  code: string
  risk: number
  level: string
  district: string
  state: string
}

interface IndiaRiskMapProps {
  centres: CentreGeo[]
  onSelectCentre: (centreId: string) => void
  className?: string
}

export const IndiaRiskMap: React.FC<IndiaRiskMapProps> = ({ centres, onSelectCentre, className = '' }) => {
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)

  // Aggregate by state
  const stateSummary = React.useMemo(() => {
    const map = new Map<string, { total: number; avgRisk: number; critical: number; high: number }>()
    centres.forEach((c) => {
      const cur = map.get(c.state) || { total: 0, avgRisk: 0, critical: 0, high: 0 }
      cur.total += 1
      cur.avgRisk += c.risk
      if (c.level === 'CRITICAL') cur.critical += 1
      if (c.level === 'HIGH') cur.high += 1
      map.set(c.state, cur)
    })
    return Array.from(map.entries()).map(([state, data]) => ({
      state,
      total: data.total,
      avgRisk: Math.round(data.avgRisk / data.total),
      critical: data.critical,
      high: data.high,
    }))
  }, [centres])

  // Districts within selected state
  const districtSummary = React.useMemo(() => {
    if (!selectedState) return []
    const map = new Map<string, { total: number; avgRisk: number; critical: number }>()
    centres
      .filter((c) => c.state === selectedState)
      .forEach((c) => {
        const cur = map.get(c.district) || { total: 0, avgRisk: 0, critical: 0 }
        cur.total += 1
        cur.avgRisk += c.risk
        if (c.level === 'CRITICAL') cur.critical += 1
        map.set(c.district, cur)
      })
    return Array.from(map.entries()).map(([district, data]) => ({
      district,
      total: data.total,
      avgRisk: Math.round(data.avgRisk / data.total),
      critical: data.critical,
    }))
  }, [centres, selectedState])

  // Centres within selected district
  const filteredCentres = React.useMemo(() => {
    if (!selectedState) return []
    return centres.filter(
      (c) => c.state === selectedState && (!selectedDistrict || c.district === selectedDistrict)
    )
  }, [centres, selectedState, selectedDistrict])

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col ${className}`}>
      {/* Breadcrumb Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 flex-wrap">
          <button
            onClick={() => {
              setSelectedState(null)
              setSelectedDistrict(null)
            }}
            className={`hover:text-blue-900 transition-colors ${
              !selectedState ? 'text-blue-900 font-bold underline' : 'text-slate-500'
            }`}
          >
            National Overview (India)
          </button>
          {selectedState && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => setSelectedDistrict(null)}
                className={`hover:text-blue-900 transition-colors ${
                  !selectedDistrict ? 'text-blue-900 font-bold underline' : 'text-slate-500'
                }`}
              >
                {selectedState}
              </button>
            </>
          )}
          {selectedDistrict && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-blue-900 font-bold">{selectedDistrict}</span>
            </>
          )}
        </div>

        {selectedState && (
          <button
            onClick={() => {
              if (selectedDistrict) setSelectedDistrict(null)
              else setSelectedState(null)
            }}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* Level 1: National State-wise Choropleth Heatmap Grid */}
      {!selectedState && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Select a State/UT jurisdiction to inspect district compliance heatmap:</span>
            <span className="font-mono text-[11px] text-slate-400">{stateSummary.length} Monitored States</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stateSummary.map((st) => {
              const isCrit = st.avgRisk >= 70
              const isMod = st.avgRisk >= 40 && st.avgRisk < 70
              return (
                <div
                  key={st.state}
                  onClick={() => setSelectedState(st.state)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${
                    isCrit
                      ? 'bg-rose-50/40 border-rose-200'
                      : isMod
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{st.state}</span>
                    <RiskBadge score={st.avgRisk} showScore={false} />
                  </div>
                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="text-slate-500">Risk Score:</span>
                    <span className="font-bold text-slate-800">{st.avgRisk}/100</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{st.total} Centres</span>
                    {st.critical > 0 ? (
                      <span className="text-rose-600 font-bold flex items-center gap-0.5">
                        <AlertOctagon className="w-3 h-3" /> {st.critical} Critical
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Healthy
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Level 2: District-wise Breakdown within Selected State */}
      {selectedState && !selectedDistrict && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500">
            Districts in <span className="font-bold text-slate-800">{selectedState}</span>. Select a district to inspect physical centre nodes:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {districtSummary.map((d) => (
              <div
                key={d.district}
                onClick={() => setSelectedDistrict(d.district)}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-blue-50/40 hover:border-blue-300 cursor-pointer transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-800" />
                    {d.district}
                  </span>
                  <RiskBadge score={d.avgRisk} />
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-between mt-2 pt-1 border-t border-slate-200">
                  <span>{d.total} Centres</span>
                  <span className="text-blue-900 font-semibold flex items-center gap-0.5">
                    View <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level 3: Centres List in Selected District */}
      {selectedDistrict && (
        <div className="space-y-2">
          <div className="text-xs text-slate-500 mb-2">
            Active Training Centres in <span className="font-bold text-slate-800">{selectedDistrict}, {selectedState}</span>:
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {filteredCentres.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCentre(c.id)}
                className="p-3 flex items-center justify-between hover:bg-blue-50/50 cursor-pointer transition-colors bg-white"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{c.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {c.code}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {c.district}, {c.state}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RiskBadge score={c.risk} level={c.level} />
                  <button className="px-2 py-1 rounded bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-semibold transition-colors">
                    Audit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
