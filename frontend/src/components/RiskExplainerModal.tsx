import React, { useEffect, useState } from 'react'
import {
  X, AlertTriangle, ShieldAlert, Cpu, Video, TrendingUp, CheckCircle, Send
} from 'lucide-react'
import { useSentinelStore } from '../store/useSentinelStore'

interface RiskExplainData {
  centre_id: string
  centre_code: string
  centre_name: string
  current_risk_score: number
  current_risk_level: string
  factors: {
    factor_type: string
    weight: number
    score_contribution: number
    explanation: string
  }[]
  recommended_intervention: string
}

export const RiskExplainerModal: React.FC = () => {
  const {
    isExplainerOpen, explainerCentreId, closeExplainer, openInterventionModal
  } = useSentinelStore()

  const [data, setData] = useState<RiskExplainData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isExplainerOpen && explainerCentreId) {
      setLoading(true)
      fetch(`/api/v1/risk/centres/${explainerCentreId}/explain`)
        .then((res) => res.json())
        .then((resData) => setData(resData))
        .catch((err) => console.error('Explain fetch failed:', err))
        .finally(() => setLoading(false))
    }
  }, [isExplainerOpen, explainerCentreId])

  if (!isExplainerOpen) return null

  const getFactorIcon = (type: string) => {
    switch (type) {
      case 'ATTENDANCE_INTEGRITY':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'EQUIPMENT_COMPLIANCE':
        return <Cpu className="w-4 h-4 text-amber-400" />
      case 'TELEMETRY_HEALTH':
        return <Video className="w-4 h-4 text-cyan-400" />
      default:
        return <TrendingUp className="w-4 h-4 text-purple-400" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-950 p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-800 text-red-400 shadow-glow-red">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Explainable Risk Intelligence Breakdown
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                {data?.centre_name} ({data?.centre_code})
              </p>
            </div>
          </div>
          <button
            onClick={closeExplainer}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Score & Risk Level Banner */}
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Composite Risk Score
                </span>
                <div className="text-2xl font-black font-mono text-red-400 mt-0.5">
                  {data?.current_risk_score} / 100
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Classification
                </span>
                <div className="text-sm font-bold font-mono px-3 py-1 rounded bg-red-950 text-red-300 border border-red-800 mt-1">
                  {data?.current_risk_level}
                </div>
              </div>
            </div>

            {/* Answer 1: Why is this centre risky? */}
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5">
                Pillar-by-Pillar Factor Analysis
              </h4>
              <div className="space-y-2.5">
                {data?.factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-gray-900/60 border border-gray-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded bg-gray-800 mt-0.5 flex-shrink-0">
                        {getFactorIcon(factor.factor_type)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-200">
                          {factor.factor_type.replace('_', ' ')} (Weight: {Math.round(factor.weight * 100)}%)
                        </div>
                        <div className="text-gray-400 mt-0.5 leading-relaxed">
                          {factor.explanation}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 font-mono font-bold text-red-400">
                      +{factor.score_contribution} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Answer 2: What action should the officer take? */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Recommended Preventive Intervention
              </span>
              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                {data?.recommended_intervention}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                onClick={closeExplainer}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-semibold transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeExplainer()
                  openInterventionModal(data!.centre_id)
                }}
                className="px-4 py-2 rounded-lg bg-red-950 hover:bg-red-900 text-xs text-red-200 font-semibold border border-red-800 flex items-center gap-2 shadow-glow-red transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Intervention Protocol
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
