import React, { useState } from 'react'
import { X, Send, MessageSquare, ShieldAlert, Loader2, CheckCircle } from 'lucide-react'
import { useSentinelStore } from '../store/useSentinelStore'

export const InterventionModal: React.FC = () => {
  const { isInterventionModalOpen, interventionCentreId, closeInterventionModal, centres } = useSentinelStore()

  const [type, setType] = useState('SURPRISE_PHYSICAL_INSPECTION')
  const [actionText, setActionText] = useState(
    'Execute unannounced physical verification of IoT Lab 101 with QR asset scanner. Freeze next subsidy installment until rectified.'
  )
  const [sendWhatsApp, setSendWhatsApp] = useState(true)
  const [phone, setPhone] = useState('+91-9811554433')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isInterventionModalOpen || !interventionCentreId) return null

  const centre = centres.find((c) => c.id === interventionCentreId)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/interventions/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centre_id: interventionCentreId,
          type,
          recommended_action: actionText,
          send_whatsapp: sendWhatsApp,
          officer_phone: phone,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          closeInterventionModal()
        }, 2500)
      }
    } catch (err) {
      console.error('Trigger intervention error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-950 p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-950 border border-red-800 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Initiate Preventive Intervention
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Target: {centre?.name || interventionCentreId}
              </p>
            </div>
          </div>
          <button onClick={closeInterventionModal} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-white">Intervention Order Dispatched</h4>
            <p className="text-xs text-gray-300">
              Logged to immutable audit trail. {sendWhatsApp && 'Officer WhatsApp notification delivered.'}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            {/* Action Type */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Intervention Protocol</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="SURPRISE_PHYSICAL_INSPECTION">Immediate Surprise Physical Inspection</option>
                <option value="SHOW_CAUSE_NOTICE">Digital Show-Cause Notice (48h deadline)</option>
                <option value="SUBSIDY_HOLD">Temporary Milestone Subsidy Disbursement Freeze</option>
              </select>
            </div>

            {/* Action Text */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Order Details & Terms</label>
              <textarea
                rows={3}
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* WhatsApp Integration Box */}
            <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Dispatch Instant Officer WhatsApp Alert
                </span>
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              {sendWhatsApp && (
                <div>
                  <label className="text-[11px] text-gray-400">Designated Officer WhatsApp Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded p-1.5 text-xs text-emerald-300 font-mono mt-1"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={closeInterventionModal}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-200 font-semibold border border-red-800 flex items-center gap-1.5 shadow-glow-red disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Issue Protocol
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
