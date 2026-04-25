import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BrowseJobs from './pages/BrowseJobs'
import PostJob from './pages/PostJob'
import JobDetail from './pages/JobDetail'
import BecomePrinter from './pages/BecomePrinter'
import PrinterProfile from './pages/PrinterProfile'
import AdminOverview from './pages/AdminOverview'
import AdminJobs from './pages/AdminJobs'
import AdminReview from './pages/AdminReview'
import AdminAppeals from './pages/AdminAppeals'
import AppealPage from './pages/AppealPage'
import ProfilePage from './pages/ProfilePage'
import BrowsePartners from './pages/BrowsePartners'
import PartnerView from './pages/PartnerView'
import PartnerRequests from './pages/PartnerRequests'
import ConversationsInbox from './pages/ConversationsInbox'
import ConversationThread from './pages/ConversationThread'
import AdminReports from './pages/AdminReports'
import SettingsPage from './pages/SettingsPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <AdminLayout>{children}</AdminLayout>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isPrinter, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <>{children}</>
  return <Navigate to={isAdmin ? '/admin' : isPrinter ? '/requests' : '/browse-partners'} replace />
}

function RootRoute() {
  const { user, isAdmin, isPrinter, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <Landing />
  return <Navigate to={isAdmin ? '/admin' : isPrinter ? '/requests' : '/browse-partners'} replace />
}

function Splash() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-muted text-sm">Loading...</div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/browse" element={<PrivateRoute><BrowseJobs /></PrivateRoute>} />
      <Route path="/jobs/new" element={<PrivateRoute><PostJob /></PrivateRoute>} />
      <Route path="/jobs/:id" element={<PrivateRoute><JobDetail /></PrivateRoute>} />
      <Route path="/become-printer" element={<PrivateRoute><BecomePrinter /></PrivateRoute>} />
      <Route path="/printer/profile" element={<PrivateRoute><PrinterProfile /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
      <Route path="/admin/jobs" element={<AdminRoute><AdminJobs /></AdminRoute>} />
      <Route path="/admin/partners" element={<AdminRoute><AdminReview /></AdminRoute>} />
      <Route path="/admin/appeals" element={<AdminRoute><AdminAppeals /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
      <Route path="/appeal" element={<PrivateRoute><AppealPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
      <Route path="/browse-partners" element={<PrivateRoute><BrowsePartners /></PrivateRoute>} />
      <Route path="/partners/:id" element={<PrivateRoute><PartnerView /></PrivateRoute>} />
      <Route path="/requests" element={<PrivateRoute><PartnerRequests /></PrivateRoute>} />
      <Route path="/conversations" element={<PrivateRoute><ConversationsInbox /></PrivateRoute>} />
      <Route path="/conversations/:id" element={<PrivateRoute><ConversationThread /></PrivateRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
