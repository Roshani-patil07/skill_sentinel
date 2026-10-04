import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { TopNav } from './TopNav'
import { Sidebar } from './Sidebar'
import { DemoModeBanner } from './DemoModeBanner'
import { CommandPalette } from '../ui/CommandPalette'
import { Toast } from '../ui/Toast'
import { useSentinelStore } from '../../store/useSentinelStore'

export const AppLayout: React.FC = () => {
  const navigate = useNavigate()
  const {
    isCommandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
    toast,
    setToast,
    setWsConnected,
    updateCentreRisk,
    addLiveEvent,
    audioAlertsEnabled,
    centres,
    setCentres,
  } = useSentinelStore()

  // Fetch initial centres on load
  useEffect(() => {
    fetch('/api/v1/centres')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCentres(data)
        }
      })
      .catch((err) => console.warn('Centres API offline, using local mock registry:', err))
  }, [setCentres])

  // Real-Time WebSocket Connection Handler with Heartbeat & Auto-reconnect
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const defaultWsUrl = `${protocol}//${window.location.host}/api/v1/ws`
    const wsUrl = (import.meta as any).env?.VITE_WS_URL || defaultWsUrl

    let ws: WebSocket | null = null
    let reconnectTimeout: any = null
    let heartbeatInterval: any = null

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          setWsConnected(true)
          // Heartbeat ping every 25 seconds to keep proxies and cloud load balancers alive
          heartbeatInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send('ping')
            }
          }, 25000)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.event === 'pong') return // Heartbeat acknowledgement

            if (data.centre_id && data.new_risk_score !== undefined) {
              updateCentreRisk(data.centre_id, data.new_risk_score, data.risk_level)
            }

            if (data.event) {
              const title =
                data.type === 'ATTENDANCE_MISMATCH' || data.type === 'GHOST_ATTENDANCE'
                  ? `Attendance Discrepancy Flagged: ${data.centre_name || data.centre_id}`
                  : data.event === 'COMPLIANCE_RESTORED'
                  ? `Compliance Restored: ${data.centre_name || data.centre_id}`
                  : `Alert: ${data.event}`

              setToast({
                id: Math.random().toString(),
                title,
                message: data.recommendation || `Risk adjusted to ${data.new_risk_score || 'N/A'}/100`,
                severity: data.risk_level === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
              })

              addLiveEvent({
                id: Math.random().toString(),
                title,
                timestamp: new Date().toISOString(),
                type: data.event,
                severity: data.risk_level === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
                payload: data,
              })

              // Web Audio chime if enabled
              if (audioAlertsEnabled) {
                try {
                  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
                  const osc = audioCtx.createOscillator()
                  const gain = audioCtx.createGain()
                  osc.frequency.setValueAtTime(587.33, audioCtx.currentTime)
                  osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15)
                  gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
                  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
                  osc.connect(gain)
                  gain.connect(audioCtx.destination)
                  osc.start()
                  osc.stop(audioCtx.currentTime + 0.3)
                } catch (e) {}
              }
            }
          } catch (e) {
            console.error('WS Parse Error:', e)
          }
        }

        ws.onclose = () => {
          setWsConnected(false)
          if (heartbeatInterval) clearInterval(heartbeatInterval)
          reconnectTimeout = setTimeout(connect, 3000)
        }
      } catch (err) {
        setWsConnected(false)
        if (heartbeatInterval) clearInterval(heartbeatInterval)
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (ws) ws.close()
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (heartbeatInterval) clearInterval(heartbeatInterval)
    }
  }, [audioAlertsEnabled, setWsConnected, updateCentreRisk, addLiveEvent, setToast])

  // Build command palette options
  const commands = React.useMemo(() => {
    const list: any[] = [
      {
        id: 'nav-dash',
        title: 'National Command Dashboard',
        category: 'Navigation',
        onSelect: () => navigate('/dashboard'),
      },
      {
        id: 'nav-centres',
        title: 'Training Centres Directory',
        category: 'Navigation',
        onSelect: () => navigate('/centres'),
      },
      {
        id: 'nav-live',
        title: 'Live Camera Feeds & Telemetry',
        category: 'Navigation',
        onSelect: () => navigate('/live'),
      },
      {
        id: 'nav-risk',
        title: 'National Risk Intelligence Radar',
        category: 'Navigation',
        onSelect: () => navigate('/risk'),
      },
      {
        id: 'nav-interventions',
        title: 'Intervention Centre & Early Warnings',
        category: 'Navigation',
        onSelect: () => navigate('/interventions'),
      },
      {
        id: 'nav-inspections',
        title: 'Field Inspections Suite',
        category: 'Navigation',
        onSelect: () => navigate('/inspections'),
      },
      {
        id: 'nav-qr',
        title: 'QR Asset Scanner & Verification',
        category: 'Navigation',
        onSelect: () => navigate('/qr'),
      },
      {
        id: 'nav-ar',
        title: 'AR Room Inspection Mode',
        category: 'Navigation',
        onSelect: () => navigate('/ar-inspection'),
      },
      {
        id: 'nav-assets',
        title: 'Sanctioned Asset Registry',
        category: 'Navigation',
        onSelect: () => navigate('/assets'),
      },
      {
        id: 'nav-analytics',
        title: 'Compliance Analytics & Trends',
        category: 'Navigation',
        onSelect: () => navigate('/analytics'),
      },
      {
        id: 'nav-settings',
        title: 'System Settings & Risk Formula Weights',
        category: 'Navigation',
        onSelect: () => navigate('/settings'),
      },
    ]

    // Add individual centres
    centres.forEach((c) => {
      list.push({
        id: `centre-${c.id}`,
        title: `${c.name} (${c.centre_code}) - ${c.district_name}, ${c.state_name}`,
        category: 'Centre',
        onSelect: () => navigate(`/centres/${c.id}`),
      })
    })

    return list
  }, [centres, navigate])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <TopNav onOpenCommandPalette={openCommandPalette} />
      <DemoModeBanner />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-5 sm:p-6 overflow-x-hidden min-h-[calc(100vh-6rem)]">
          <Outlet />
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        commands={commands}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
