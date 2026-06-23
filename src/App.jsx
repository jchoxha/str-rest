import { useState } from 'react'
import HostDashboard from './components/HostDashboard'
import GuestView from './components/GuestView'
import { defaultPropertiesData } from './data/defaultProperties'

function App() {
  const [activeView, setActiveView] = useState('host')
  const [propertiesData, setPropertiesData] = useState(defaultPropertiesData)

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
