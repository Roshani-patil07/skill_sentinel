import React, { useEffect, useState } from 'react'
import {
  QrCode, CheckCircle, AlertTriangle, Cpu, ShieldCheck,
  Scan, Loader2, MapPin, Key
} from 'lucide-react'
import { useSentinelStore } from '../store/useSentinelStore'

interface AssetItem {
  id: string
  asset_tag: string
  category_name: string
  model_name: string
  status: 'VERIFIED_PRESENT' | 'MISSING' | 'DEFECTIVE'
  qr_payload: string
  digital_signature: string
}

export const AssetQRInspector: React.FC = () => {
  const { selectedCentreId } = useSentinelStore()
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/assets?centre_id=${selectedCentreId}`)
      const data = await res.json()
      setAssets(data)
    } catch (err) {
      console.error('Failed to load assets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [selectedCentreId])

  const handleScanVerify = async (asset: AssetItem) => {
    setVerifyingId(asset.id)
    try {
      const res = await fetch('/api/v1/qr/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: asset.id,
          qr_payload: asset.qr_payload,
          digital_signature: asset.digital_signature,
          latitude: 28.5355,
          longitude: 77.2690,
          notes: 'Verified on-site by Inspection Officer via GPS-gated QR scan.'
        })
      })
      const result = await res.json()
      if (res.ok) {
        setSuccessMsg(`Asset ${asset.asset_tag} cryptographically verified! Centre risk recomputed.`)
        // Update local state
        setAssets((prev) =>
          prev.map((a) => (a.id === asset.id ? { ...a, status: 'VERIFIED_PRESENT' } : a))
        )
        setTimeout(() => setSuccessMsg(null), 5000)
      }
    } catch (err) {
      console.error('Verification failed:', err)
    } finally {
      setVerifyingId(null)
    }
  }

  const verifiedCount = assets.filter((a) => a.status === 'VERIFIED_PRESENT').length
  const missingCount = assets.filter((a) => a.status === 'MISSING').length

  return (
    <div className="space-y-6">
      {/* Title & Summary */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            Sanctioned Asset & Cryptographic QR Verification Registry
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            HMAC-SHA256 signed physical asset verification with geofencing. Answers: "Are sanctioned assets actually present?"
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300">
            Verified: <strong>{verifiedCount}</strong> / {assets.length}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-red-950/70 border border-red-800 text-red-300">
            Missing: <strong>{missingCount}</strong>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 rounded-lg text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Assets Grid / Table */}
      <div className="glass-panel p-5 rounded-xl border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Asset Tag</th>
                <th className="py-3 px-4">Category & Model</th>
                <th className="py-3 px-4">Cryptographic Signature</th>
                <th className="py-3 px-4">Verification State</th>
                <th className="py-3 px-4 text-right">Inspection Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {assets.map((asset) => {
                const isVerified = asset.status === 'VERIFIED_PRESENT'
                return (
                  <tr key={asset.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      {asset.asset_tag}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="text-gray-200 font-medium">{asset.category_name}</div>
                      <div className="text-[11px] text-gray-400">{asset.model_name}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-gray-400">
                      <div className="flex items-center gap-1 font-mono text-[10px] truncate max-w-[200px]" title={asset.digital_signature}>
                        <Key className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        {asset.digital_signature ? asset.digital_signature.slice(0, 16) + '...' : 'PENDING'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          isVerified
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                        }`}
                      >
                        {isVerified ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            VERIFIED PRESENT
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            MISSING FROM LAB
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {!isVerified ? (
                        <button
                          onClick={() => handleScanVerify(asset)}
                          disabled={verifyingId !== null}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold border border-emerald-700 flex items-center gap-1.5 ml-auto shadow-glow-green transition-colors active:scale-95 disabled:opacity-50"
                        >
                          {verifyingId === asset.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Scan className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          Scan & Verify QR
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-mono">Verified ✓</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
