import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data Synchronization Error',
  message = 'Failed to retrieve telemetry from central intelligence node. Please check network connection.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center bg-rose-50/50 rounded-lg border border-rose-200 flex flex-col items-center justify-center ${className}`}>
      <div className="p-3 rounded-full bg-rose-100 text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-rose-900 tracking-tight">{title}</h4>
      <p className="text-xs text-rose-700 max-w-sm mt-1 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded-md bg-white border border-rose-300 text-xs font-semibold text-rose-800 hover:bg-rose-50 flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  )
}
