import React from 'react'
import { AlertOctagon, CheckCircle2, Info, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  title: string
  message?: string
  severity?: 'CRITICAL' | 'WARNING' | 'SUCCESS' | 'INFO'
}

interface ToastProps {
  toast: ToastMessage | null
  onDismiss: () => void
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null

  const sev = toast.severity || 'INFO'
  let icon = <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
  let border = 'border-blue-200 bg-white'

  if (sev === 'CRITICAL') {
    icon = <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
    border = 'border-rose-300 bg-rose-50/90 text-rose-900'
  } else if (sev === 'SUCCESS') {
    icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
    border = 'border-emerald-300 bg-emerald-50/90 text-emerald-900'
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom duration-200">
      <div className={`p-4 rounded-xl border shadow-lg flex items-start justify-between gap-3 ${border}`}>
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">{icon}</div>
          <div>
            <h5 className="text-xs font-bold leading-tight">{toast.title}</h5>
            {toast.message && <p className="text-[11px] opacity-90 mt-0.5">{toast.message}</p>}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
