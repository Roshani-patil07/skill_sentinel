import { create } from 'zustand'

export type UserRole =
  | 'SUPER_ADMIN'
  | 'NATIONAL_OFFICER'
  | 'STATE_OFFICER'
  | 'DISTRICT_OFFICER'
  | 'INSPECTION_OFFICER'
  | 'CENTRE_ADMIN'

export interface TrainingCentreItem {
  id: string
  centre_code: string
  name: string
  address: string
  district_name: string
  state_name: string
  current_risk_score: number
  current_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string
  active_cameras: number
  active_batches: number
  total_assets: number
  verified_assets?: number
  missing_assets?: number
}

export interface DiscrepancyItem {
  id: string
  centre_id: string
  centre_code: string
  centre_name: string
  batch_code: string
  course_title: string
  sanctioned_strength: number
  reported_attendance: number
  observed_headcount: number
  discrepancy_percentage: number
  severity: string
  status: string
  detected_at: string
}

export interface LiveEvent {
  id: string
  title: string
  timestamp: string
  type: string
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  payload: any
}

export interface ToastData {
  id: string
  title: string
  message?: string
  severity?: 'CRITICAL' | 'WARNING' | 'SUCCESS' | 'INFO'
}

interface SentinelState {
  currentRole: UserRole
  setRole: (role: UserRole) => void
  selectedCentreId: string
  setSelectedCentreId: (id: string) => void

  centres: TrainingCentreItem[]
  setCentres: (centres: TrainingCentreItem[]) => void
  updateCentreRisk: (centreId: string, newScore: number, newLevel: any) => void

  discrepancies: DiscrepancyItem[]
  setDiscrepancies: (discrepancies: DiscrepancyItem[]) => void
  addDiscrepancy: (item: DiscrepancyItem) => void

  liveEvents: LiveEvent[]
  addLiveEvent: (event: LiveEvent) => void

  isExplainerOpen: boolean
  explainerCentreId: string | null
  openExplainer: (centreId: string) => void
  closeExplainer: () => void

  isInterventionModalOpen: boolean
  interventionCentreId: string | null
  openInterventionModal: (centreId: string) => void
  closeInterventionModal: () => void

  isWsConnected: boolean
  setWsConnected: (connected: boolean) => void

  isDemoMode: boolean
  toggleDemoMode: () => void

  audioAlertsEnabled: boolean
  toggleAudioAlerts: () => void

  toast: ToastData | null
  setToast: (toast: ToastData | null) => void

  activeTab: string
  setActiveTab: (tab: string) => void

  isCommandPaletteOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
}

export const useSentinelStore = create<SentinelState>((set) => ({
  activeTab: 'OVERVIEW',
  setActiveTab: (tab) => set({ activeTab: tab }),
  currentRole: 'NATIONAL_OFFICER',
  setRole: (role) => set({ currentRole: role }),
  selectedCentreId: 'tc-del-042',
  setSelectedCentreId: (id) => set({ selectedCentreId: id }),

  centres: [],
  setCentres: (centres) => set({ centres }),
  updateCentreRisk: (centreId, newScore, newLevel) =>
    set((state) => ({
      centres: state.centres.map((c) =>
        c.id === centreId
          ? { ...c, current_risk_score: newScore, current_risk_level: newLevel }
          : c
      ),
    })),

  discrepancies: [],
  setDiscrepancies: (discrepancies) => set({ discrepancies }),
  addDiscrepancy: (item) =>
    set((state) => ({
      discrepancies: [item, ...state.discrepancies],
    })),

  liveEvents: [],
  addLiveEvent: (event) =>
    set((state) => ({
      liveEvents: [event, ...state.liveEvents.slice(0, 49)],
    })),

  isExplainerOpen: false,
  explainerCentreId: null,
  openExplainer: (centreId) => set({ isExplainerOpen: true, explainerCentreId: centreId }),
  closeExplainer: () => set({ isExplainerOpen: false, explainerCentreId: null }),

  isInterventionModalOpen: false,
  interventionCentreId: null,
  openInterventionModal: (centreId) => set({ isInterventionModalOpen: true, interventionCentreId: centreId }),
  closeInterventionModal: () => set({ isInterventionModalOpen: false, interventionCentreId: null }),

  isWsConnected: false,
  setWsConnected: (connected) => set({ isWsConnected: connected }),

  isDemoMode: true,
  toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),

  audioAlertsEnabled: false,
  toggleAudioAlerts: () => set((state) => ({ audioAlertsEnabled: !state.audioAlertsEnabled })),

  toast: null,
  setToast: (toast) => set({ toast }),

  isCommandPaletteOpen: false,
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
}))
