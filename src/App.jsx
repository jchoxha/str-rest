import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import HostDashboard from './components/HostDashboard'
import GuestView from './components/GuestView'
import ProtectedRoute from './auth/ProtectedRoute'

// Extract subdomain from current hostname if present
function getSubdomain() {
  try {
    const params = new URLSearchParams(window.location.search)
    const querySub = params.get('subdomain') || params.get('host_subdomain')
    if (querySub) return querySub.toLowerCase()

    const hostname = window.location.hostname.toLowerCase()
    // Ignore IP addresses or pure localhost
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname === 'localhost') {
      return null
    }

    const reserved = ['www', 'app', 'api', 'admin', 'stage', 'staging', 'mail', 'auth']

    if (hostname.endsWith('.str.rest')) {
      const sub = hostname.slice(0, -'.str.rest'.length)
      if (sub && !reserved.includes(sub)) return sub
    }

    if (hostname.endsWith('.localhost')) {
      const sub = hostname.slice(0, -'.localhost'.length)
      if (sub && !reserved.includes(sub)) return sub
    }

    const parts = hostname.split('.')
    if (parts.length > 2 && !reserved.includes(parts[0])) {
      return parts[0]
    }
  } catch {
    // fallback
  }

  return null
}

// Key GuestView by slug so navigating between guest pages remounts it fresh.
function GuestRoute() {
  const { slug } = useParams()
  return <GuestView key={slug} slug={slug} />
}

function App() {
  const subdomain = getSubdomain()

  // If visiting via a property subdomain (e.g. bostonbunkhouse.str.rest),
  // render the guest view directly at root.
  if (subdomain) {
    return (
      <Routes>
        <Route path="/" element={<GuestView key={subdomain} slug={subdomain} />} />
        <Route path="/p/:slug" element={<GuestRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<GuestView key={subdomain} slug={subdomain} />} />
      </Routes>
    )
  }

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
