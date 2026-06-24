import { useState, useEffect } from 'react'
import HostDashboard from './components/HostDashboard'
import GuestView from './components/GuestView'
import { defaultPropertiesData } from './data/defaultProperties'

// Bump the version suffix whenever the shape of the stored data changes in a
// way that older payloads can't satisfy.
const STORAGE_KEY = 'str.rest:properties:v1'

function loadProperties() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Corrupt JSON or unavailable storage (private mode, quota) — fall back.
  }
  return defaultPropertiesData
}

function App() {
  const [activeView, setActiveView] = useState('host')
  const [propertiesData, setPropertiesData] = useState(loadProperties)

  // Persist host edits so they survive a refresh. Note: seed image URLs are
  // build-hashed, so demo images saved by a returning visitor may break after
  // a redeploy — text edits are unaffected.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(propertiesData))
    } catch {
      // Storage full or unavailable — edits stay in memory for this session.
    }
  }, [propertiesData])

  return (
    <div className="go-wrap">
      <div className="toggle-bar">
        <button
          className={`tog-btn ${activeView === 'host' ? 'active' : ''}`}
          onClick={() => setActiveView('host')}
        >
          Host
        </button>
        <button
          className={`tog-btn guest ${activeView === 'guest' ? 'active' : ''}`}
          onClick={() => setActiveView('guest')}
        >
          Guest
        </button>
      </div>

      {activeView === 'host' ?
        <HostDashboard propertiesData={propertiesData} setPropertiesData={setPropertiesData} /> :
        <GuestView propertiesData={propertiesData} />
      }
    </div>
  )
}

export default App
