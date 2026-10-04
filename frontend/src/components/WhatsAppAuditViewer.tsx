import React, { useEffect, useState } from 'react'
import { MessageSquare, CheckCheck, Clock, ShieldAlert } from 'lucide-react'

interface WhatsAppItem {
  id: string
  recipient: string
  body: string
  status: string
  dispatched_at: string
}

export const WhatsAppAuditViewer: React.FC = () => {
  const [logs, setLogs] = useState<WhatsAppItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/v1/notifications')
      const data = await res.json()
      setLogs(data.whatsapp_logs || [])
    } catch (err) {
      console.error('Failed to load whatsapp logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl border border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Officer WhatsApp Dispatch Gateway Audit Trail
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Automated compliance alerts and intervention notices dispatched directly to District and Inspection Officers
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-emerald-300 font-medium border border-gray-700 transition-colors"
        >
          Refresh Feed
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="glass-panel p-4 rounded-xl border border-gray-800 space-y-3 bg-gray-950/60"
          >
            <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-800/80">
              <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                Delivered to {log.recipient}
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                {new Date(log.dispatched_at).toLocaleTimeString()}
              </span>
            </div>
            <pre className="text-xs text-gray-300 font-sans whitespace-pre-wrap leading-relaxed bg-gray-900/80 p-3 rounded-lg border border-gray-800">
              {log.body}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
