import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { CentresListPage } from './pages/CentresListPage'
import { CentreDetailPage } from './pages/CentreDetailPage'
import { LiveMonitoringPage } from './pages/LiveMonitoringPage'
import { RiskIntelligencePage } from './pages/RiskIntelligencePage'
import { InterventionsPage } from './pages/InterventionsPage'
import { InspectionsPage } from './pages/InspectionsPage'
import { QRInspectionPage } from './pages/QRInspectionPage'
import { ARInspectionPage } from './pages/ARInspectionPage'
import { AssetsRegistryPage } from './pages/AssetsRegistryPage'
import { ComplianceAnalyticsPage } from './pages/ComplianceAnalyticsPage'
import { UsersManagementPage } from './pages/UsersManagementPage'
import { SettingsPage } from './pages/SettingsPage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Core Government Command Layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/centres" element={<CentresListPage />} />
          <Route path="/centres/:id" element={<CentreDetailPage />} />
          <Route path="/live" element={<LiveMonitoringPage />} />
          <Route path="/risk" element={<RiskIntelligencePage />} />
          <Route path="/interventions" element={<InterventionsPage />} />
          <Route path="/inspections" element={<InspectionsPage />} />
          <Route path="/qr" element={<QRInspectionPage />} />
          <Route path="/ar-inspection" element={<ARInspectionPage />} />
          <Route path="/assets" element={<AssetsRegistryPage />} />
          <Route path="/analytics" element={<ComplianceAnalyticsPage />} />
          <Route path="/users" element={<UsersManagementPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

