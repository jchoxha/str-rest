import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import HostDashboard from './components/HostDashboard'
import GuestView from './components/GuestView'
import ProtectedRoute from './auth/ProtectedRoute'

// Key GuestView by slug so navigating between guest pages remounts it fresh.
function GuestRoute() {
  const { slug } = useParams()
  return <GuestView key={slug} />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <HostDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/p/:slug" element={<GuestRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
