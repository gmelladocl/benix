import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Layout/Sidebar'
import ToastContainer from './components/UI/Toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ContentCalendar from './pages/ContentCalendar'
import Accounting from './pages/Accounting'
import MindMap from './pages/MindMap'
import Vault from './pages/Vault'
import ContentCreation from './pages/ContentCreation'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--cream)' }}><div className="skeleton" style={{width:120,height:32,borderRadius:8}} /></div>
  if (!user) return <Navigate to="/" state={{ from: location }} replace />
  return children
}

function AppShell({ children }) {
  const { theme } = useApp()
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '')
  }, [theme])
  return children
}

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}

function AppRoutes() {
  return (
    <AppShell>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute>
            <Layout><div className="app-content" style={{paddingTop:'0', paddingBottom:'0'}}><Clients /></div></Layout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout><div className="app-content" style={{paddingTop:'0', paddingBottom:'0'}}><ContentCalendar /></div></Layout>
          </ProtectedRoute>
        } />
        <Route path="/accounting" element={
          <ProtectedRoute>
            <Layout><div className="app-content" style={{paddingTop:'0', paddingBottom:'0'}}><Accounting /></div></Layout>
          </ProtectedRoute>
        } />
        <Route path="/mindmap" element={
          <ProtectedRoute>
            <Layout><MindMap /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/vault" element={
          <ProtectedRoute>
            <Layout><div className="app-content"><Vault /></div></Layout>
          </ProtectedRoute>
        } />
        <Route path="/content" element={
          <ProtectedRoute>
            <Layout><div className="app-content" style={{paddingTop:'0', paddingBottom:'0'}}><ContentCreation /></div></Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout><div className="app-content" style={{paddingTop:'0', paddingBottom:'0'}}><Settings /></div></Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </AuthProvider>
  )
}
