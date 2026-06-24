import React, { useState } from 'react'
import GuestView from './GuestView'

function SidebarItem({ label, icon, current, onClick, onSelect, extraStyle }) {
  return (
    <div
      className={`sb-item ${current === label ? 'active' : ''}`}
      style={extraStyle || {}}
      onClick={() => {
        if (onClick) onClick();
        else onSelect(label);
      }}
    >
      {icon && <div className="sb-dot">{icon}</div>}
      {!icon && <div style={{width: '24px'}} />}
      {label}
    </div>
  )
}

export default function HostDashboard({ propertiesData, setPropertiesData }) {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [activeTab, setActiveTab] = useState('Dashboard')

  // Icons identical to original provided template
  const IconDashboard = <svg viewBox="0 0 9 9" fill="white"><rect x="1" y="1" width="3" height="3" rx="0.5"/><rect x="5" y="1" width="3" height="3" rx="0.5"/><rect x="1" y="5" width="3" height="3" rx="0.5"/><rect x="5" y="5" width="3" height="3" rx="0.5"/></svg>;
  const IconAnalytics = <svg viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="3" stroke="white" strokeWidth="1"/><line x1="4.5" y1="2.5" x2="4.5" y2="4.5" stroke="white" strokeWidth="1"/><line x1="4.5" y1="4.5" x2="6" y2="5.5" stroke="white" strokeWidth="1"/></svg>;
  const IconProperty = <svg viewBox="0 0 9 9" fill="none"><path d="M1 5 L4.5 2 L8 5 L8 8 L1 8 Z" stroke="white" strokeWidth="1"/></svg>;
  const IconShop = <svg viewBox="0 0 9 9" fill="none"><rect x="1" y="3" width="7" height="5" rx="0.5" stroke="white" strokeWidth="1"/><path d="M3 3V2.5a1.5 1.5 0 013 0V3" stroke="white" strokeWidth="1"/></svg>;
  const IconAddProduct = <svg viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="3" stroke="white" strokeWidth="1"/><path d="M3 4.5h3M4.5 3v3" stroke="white" strokeWidth="1"/></svg>;
  const IconSettings = <svg viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="1.5" stroke="white" strokeWidth="1"/><path d="M4.5 1v1M4.5 7v1M1 4.5h1M7 4.5h1" stroke="white" strokeWidth="1"/></svg>;

  const renderContent = () => {
    switch (activeTab) {
      case 'Site Builder':
        return <SiteBuilderView property={selectedProperty} propertiesData={propertiesData} setPropertiesData={setPropertiesData} />
      case 'Analytics':
        return <AnalyticsView property={selectedProperty} />
      case 'Property Details':
        return <PropertyView property={selectedProperty} />
      case 'Shop My Stay':
        return <ShopView property={selectedProperty} />
      case 'Add Products':
        return <AddProductView property={selectedProperty} />
      case 'Preferences':
        return <PreferencesView property={selectedProperty} />
      case 'Dashboard':
      default:
        return <OverviewView property={selectedProperty} />
    }
  }

  if (!selectedProperty) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', padding: '40px' }}>
         <div style={{ textAlign: 'center', marginBottom: '48px' }}>
           <div style={{ color: 'white', fontSize: '42px', fontWeight: 700, letterSpacing: '-1px' }}>str.rest</div>
           <div style={{ fontSize: '18px', color: '#94a3b8', marginTop: '8px' }}>Select a property to manage</div>
         </div>
         <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1000px' }}>
           {[
             { name: 'The Littleton Tiny Home', loc: 'Littleton, NH', icon: '🏔️', rev: '$342 this week' },
             { name: 'The Riverside Loft', loc: 'Portland, ME', icon: '🏙️', rev: '$520 this week' },
             { name: 'The Summit Cabin', loc: 'Lincoln, NH', icon: '🌲', rev: '$210 this week' }
           ].map((p, i) => (
             <div 
                key={i} 
                onClick={() => setSelectedProperty(p.name)} 
                style={{ width: '280px', background: '#1e293b', borderRadius: '16px', padding: '24px', cursor: 'pointer', border: '1px solid #334155', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#334155'; }}
             >
               <div style={{ height: '120px', background: '#0f172a', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>{p.icon}</div>
               <div style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>{p.name}</div>
               <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>{p.loc}</div>
               <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #334155', fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                 {p.rev}
               </div>
             </div>
           ))}
           <div 
              style={{ width: '280px', background: 'transparent', borderRadius: '16px', padding: '24px', cursor: 'pointer', border: '2px dashed #334155', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#3b82f6'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#334155'; }}
           >
             <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#94a3b8', marginBottom: '16px' }}>+</div>
             <div style={{ fontSize: '16px', fontWeight: 500, color: '#94a3b8' }}>Add new property</div>
           </div>
         </div>
      </div>
    )
  }

  return (
    <div className="host-layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-mark">str.rest</div>
          <div className="sb-logo-sub">Host Portal</div>
        </div>
        
        {/* Switch Property Dropdown or List */}
        <div className="sb-section" style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '0.5px' }}>Current Property</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>{selectedProperty}</span>
            <button onClick={() => { setSelectedProperty(null); setActiveTab('Dashboard'); }} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Change</button>
          </div>
        </div>

        <div className="sb-section">
          <div className="sb-label">Overview</div>
          <SidebarItem label="Dashboard" icon={IconDashboard} current={activeTab} onSelect={setActiveTab} />
          <SidebarItem label="Analytics" icon={IconAnalytics} current={activeTab} onSelect={setActiveTab} />
        </div>
        
        <div className="sb-section">
          <div className="sb-label">Management</div>
          <SidebarItem label="Site Builder" icon={IconProperty} current={activeTab} onSelect={setActiveTab} />
          <SidebarItem label="Property Details" icon={IconProperty} current={activeTab} onSelect={setActiveTab} />
        </div>
        
        <div className="sb-section">
          <div className="sb-label">Storefront</div>
          <SidebarItem label="Shop My Stay" icon={IconShop} current={activeTab} onSelect={setActiveTab} />
          <SidebarItem label="Add Products" icon={IconAddProduct} current={activeTab} onSelect={setActiveTab} />
        </div>
        
        <div className="sb-section">
          <div className="sb-label">Settings</div>
          <SidebarItem label="Preferences" icon={IconSettings} current={activeTab} onSelect={setActiveTab} />
        </div>
      </div>

      {/* DYNAMIC CONTENT */}
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// SUB-VIEWS
// -----------------------------------------------------------------------------

function OverviewView({ property }) {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{property}</div>
          <div className="page-sub">Dashboard overview</div>
        </div>
        <button className="pub-btn">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Publish changes
        </button>
      </div>

      <div className="metrics">
        <div className="metric-card">
          <div className="metric-label">Guest page views</div>
          <div className="metric-val">1,284</div>
          <div className="metric-change">+12% this month</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Affiliate revenue</div>
          <div className="metric-val">$342</div>
          <div className="metric-change">+8 sales this week</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Direct bookings</div>
          <div className="metric-val">7</div>
          <div className="metric-change">Saved $840 in fees</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Link clicks</div>
          <div className="metric-val">418</div>
          <div className="metric-change">+5% vs last month</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
           <div className="dash-card-title">
             Shop Your Stay — Top Products
             <span className="dash-card-link">Manage</span>
           </div>
           <div className="product-row">
             <div className="prod-img">☕</div>
             <div style={{flex: 1}}>
               <div className="prod-name">Fellow Stagg EKG Kettle</div>
               <div style={{fontSize: '11px', color: '#94a3b8', marginTop: '2px'}}>12 clicks · 3 purchases</div>
             </div>
             <div>
               <div className="prod-price">$165</div>
               <div className="prod-badge">4.8%</div>
             </div>
           </div>
           <div className="product-row">
             <div className="prod-img">🛏️</div>
             <div style={{flex: 1}}>
               <div className="prod-name">Parachute Linen Pillow Set</div>
               <div style={{fontSize: '11px', color: '#94a3b8', marginTop: '2px'}}>9 clicks · 2 purchases</div>
             </div>
             <div>
               <div className="prod-price">$89</div>
               <div className="prod-badge">5.2%</div>
             </div>
           </div>
           <div className="product-row">
             <div className="prod-img">🕯️</div>
             <div style={{flex: 1}}>
               <div className="prod-name">Otherland Candle — Cedar</div>
               <div style={{fontSize: '11px', color: '#94a3b8', marginTop: '2px'}}>7 clicks · 1 purchase</div>
             </div>
             <div>
               <div className="prod-price">$36</div>
               <div className="prod-badge">3.5%</div>
             </div>
           </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-title">
            Recent Bookings
            <span className="dash-card-link">View all</span>
          </div>
          <div className="booking-row">
            <div>
              <div className="booking-guest">Sarah M.</div>
              <div className="booking-dates">Jun 12 – Jun 15, 2025</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <span className="booking-amt">$420</span>
              <span className="booking-src src-direct">Direct</span>
            </div>
          </div>
          <div className="booking-row">
            <div>
              <div className="booking-guest">James T.</div>
              <div className="booking-dates">Jun 8 – Jun 10, 2025</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <span className="booking-amt">$280</span>
              <span className="booking-src src-airbnb">Airbnb</span>
            </div>
          </div>
          <div className="booking-row">
            <div>
              <div className="booking-guest">Priya K.</div>
              <div className="booking-dates">Jun 3 – Jun 6, 2025</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <span className="booking-amt">$390</span>
              <span className="booking-src src-direct">Direct</span>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-title">Guest Site Sections</div>
          <div style={{display: 'grid', gap: '8px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px'}}>
              <span style={{color: '#1e293b'}}>House rules & info</span>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div className="activity-bar" style={{width: '80px'}}><div className="activity-fill" style={{width: '90%'}}></div></div>
                <span style={{fontSize: '11px', color: '#94a3b8', width: '24px'}}>90%</span>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px'}}>
              <span style={{color: '#1e293b'}}>Local recommendations</span>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div className="activity-bar" style={{width: '80px'}}><div className="activity-fill" style={{width: '72%', background: '#8b5cf6'}}></div></div>
                <span style={{fontSize: '11px', color: '#94a3b8', width: '24px'}}>72%</span>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px'}}>
              <span style={{color: '#1e293b'}}>Shop Your Stay</span>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div className="activity-bar" style={{width: '80px'}}><div className="activity-fill" style={{width: '55%', background: '#f59e0b'}}></div></div>
                <span style={{fontSize: '11px', color: '#94a3b8', width: '24px'}}>55%</span>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px'}}>
              <span style={{color: '#1e293b'}}>Direct booking page</span>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <div className="activity-bar" style={{width: '80px'}}><div className="activity-fill" style={{width: '38%', background: '#10b981'}}></div></div>
                <span style={{fontSize: '11px', color: '#94a3b8', width: '24px'}}>38%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-title">Quick Actions</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
            <button style={{padding: '10px', background: '#f8fafc', border: '0.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#1e293b', cursor: 'pointer', textAlign: 'left'}}>
              <div style={{fontSize: '16px', marginBottom: '4px'}}>✏️</div>Edit guest site
            </button>
            <button style={{padding: '10px', background: '#f8fafc', border: '0.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#1e293b', cursor: 'pointer', textAlign: 'left'}}>
              <div style={{fontSize: '16px', marginBottom: '4px'}}>🛍️</div>Add product
            </button>
            <button style={{padding: '10px', background: '#f8fafc', border: '0.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#1e293b', cursor: 'pointer', textAlign: 'left'}}>
              <div style={{fontSize: '16px', marginBottom: '4px'}}>🔗</div>Copy guest link
            </button>
            <button style={{padding: '10px', background: '#f8fafc', border: '0.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#1e293b', cursor: 'pointer', textAlign: 'left'}}>
              <div style={{fontSize: '16px', marginBottom: '4px'}}>📊</div>View analytics
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function AnalyticsView() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-sub">Traffic and conversions for the last 30 days</div>
        </div>
      </div>
      
      <div className="dash-card" style={{marginBottom: '24px'}}>
        <div className="dash-card-title">Traffic Overview</div>
        <div style={{height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '20px'}}>
          {[40, 70, 45, 90, 110, 60, 130].map((h, i) => (
            <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
              <div style={{width: '100%', height: `${h}px`, background: '#3b82f6', borderRadius: '4px 4px 0 0', opacity: i === 6 ? 1 : 0.4}}></div>
              <span style={{fontSize: '10px', color: '#94a3b8'}}>Day {i+1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-grid">
         <div className="dash-card">
           <div className="dash-card-title">Traffic Sources</div>
           <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '0.5px solid #f1f5f9', paddingBottom: '8px'}}>
               <span style={{color: '#1e293b'}}>Direct Traffic</span>
               <span style={{fontWeight: 500}}>4,204</span>
             </div>
             <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '0.5px solid #f1f5f9', paddingBottom: '8px'}}>
               <span style={{color: '#1e293b'}}>Airbnb Message Links</span>
               <span style={{fontWeight: 500}}>1,043</span>
             </div>
             <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px'}}>
               <span style={{color: '#1e293b'}}>Instagram Bio</span>
               <span style={{fontWeight: 500}}>392</span>
             </div>
           </div>
         </div>

         <div className="dash-card">
           <div className="dash-card-title">Most Clicked Items</div>
           <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '0.5px solid #f1f5f9', paddingBottom: '8px'}}>
               <span style={{color: '#1e293b'}}>Fellow Stagg EKG Kettle</span>
               <span style={{color: '#16a34a'}}>4.8% CTR</span>
             </div>
             <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '0.5px solid #f1f5f9', paddingBottom: '8px'}}>
               <span style={{color: '#1e293b'}}>Polly's Pancake Parlor (Maps)</span>
               <span style={{color: '#16a34a'}}>4.2% CTR</span>
             </div>
             <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px'}}>
               <span style={{color: '#1e293b'}}>Parachute Linen Sheets</span>
               <span style={{color: '#16a34a'}}>3.9% CTR</span>
             </div>
           </div>
         </div>
      </div>
    </>
  )
}

function PropertyView({ property }) {
  // Simple month grid
  const days = Array.from({length: 31}, (_, i) => i + 1);
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{property} Details</div>
          <div className="page-sub">Manage availability and content</div>
        </div>
        <button className="pub-btn">Save property</button>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-title">Availability (July 2025)</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginBottom: '8px'}}>
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px'}}>
            {/* offset */}
            <div/><div/>
            {days.map((day) => {
              const booked = day >= 10 && day <= 14 || day >= 22 && day <= 24;
              return (
                <div key={day} style={{aspectRatio: '1/1', background: booked ? '#fef3c7' : '#f1f5f9', border: booked ? '1px solid #f59e0b' : '1px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: booked ? '#92400e' : '#64748b'}}>
                  {day}
                </div>
              )
            })}
          </div>
        </div>

        <div className="dash-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div className="dash-card-title">Basic Info</div>
          <div>
            <label style={{fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px'}}>Display Name</label>
            <input type="text" defaultValue={property} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px'}} />
          </div>
          <div>
            <label style={{fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px'}}>Wifi Name (SSID)</label>
            <input type="text" defaultValue="LittletonGuest" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px'}} />
          </div>
          <div>
            <label style={{fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px'}}>Wifi Password</label>
            <input type="text" defaultValue="mountains24" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px'}} />
          </div>
        </div>
      </div>
    </>
  )
}

function ShopView() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Shop My Stay</div>
          <div className="page-sub">Manage your affiliate storefront</div>
        </div>
        <button className="pub-btn">+ New item</button>
      </div>

      <div className="dash-card">
        <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase'}}>
              <th style={{paddingBottom: '12px', fontWeight: 500}}>Product</th>
              <th style={{paddingBottom: '12px', fontWeight: 500}}>Price</th>
              <th style={{paddingBottom: '12px', fontWeight: 500}}>Clicks</th>
              <th style={{paddingBottom: '12px', fontWeight: 500}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { icon: '☕', name: 'Fellow Stagg EKG', price: '$165.00', clicks: 142, status: 'Active' },
              { icon: '🛏️', name: 'Parachute Linen Pillow', price: '$89.00', clicks: 84, status: 'Active' },
              { icon: '🕯️', name: 'Cedar Candle', price: '$36.00', clicks: 51, status: 'Hidden' },
            ].map((p, i) => (
              <tr key={i} style={{borderBottom: '1px solid #f1f5f9'}}>
                <td style={{padding: '16px 0'}}>
                   <div className="product-row" style={{padding: 0, border: 'none'}}>
                     <div className="prod-img">{p.icon}</div>
                     <span className="prod-name">{p.name}</span>
                   </div>
                </td>
                <td style={{padding: '16px 0', fontSize: '13px', color: '#1e293b'}}>{p.price}</td>
                <td style={{padding: '16px 0', fontSize: '13px', color: '#1e293b'}}>{p.clicks}</td>
                <td style={{padding: '16px 0', fontSize: '13px'}}>
                  <span style={{background: p.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: p.status === 'Active' ? '#166534' : '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '11px'}}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function AddProductView() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Add Product</div>
          <div className="page-sub">List a new item on your storefront</div>
        </div>
        <button className="pub-btn">Publish to Store</button>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-title">Product Details</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div>
              <label style={{fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px'}}>Affiliate Link (Amazon API Supported)</label>
              <input type="text" placeholder="https://amazon.com/dp/..." style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px'}} />
              <div style={{fontSize: '10px', color: '#3b82f6', marginTop: '6px', cursor: 'pointer'}}>Auto-fill details from Link</div>
            </div>
            <div style={{display: 'flex', gap: '16px'}}>
              <div style={{flex: 1}}>
                <label style={{fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px'}}>Display Name</label>
                <input type="text" placeholder="Product name" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px'}} />
              </div>
              <div style={{width: '100px'}}>
                <label style={{fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px'}}>Price</label>
                <input type="text" placeholder="$0.00" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px'}} />
              </div>
            </div>
          </div>
        </div>

        <div className="dash-card text-center" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px'}}>
           <div style={{width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'}}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
           </div>
           <div style={{fontSize: '13px', fontWeight: 500, color: '#1e293b', marginBottom: '4px'}}>Upload Product Image</div>
           <div style={{fontSize: '11px', color: '#94a3b8'}}>Drag and drop or click to browse</div>
        </div>
      </div>
    </>
  )
}

function PreferencesView() {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Preferences</div>
          <div className="page-sub">Manage your account settings</div>
        </div>
        <button className="pub-btn">Save changes</button>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-title">Profile Settings</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
             <div style={{width: '50px', height: '50px', borderRadius: '50%', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600}}>
               A
             </div>
             <div>
               <div style={{fontSize: '14px', fontWeight: 500, color: '#1e293b'}}>Alex & Jordan</div>
               <div style={{fontSize: '11px', color: '#94a3b8', marginTop: '2px'}}>alex@str.rest</div>
             </div>
             <button style={{marginLeft: 'auto', padding: '6px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '12px', fontWeight: 500}}>Edit</button>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <div>
                 <div style={{fontSize: '13px', color: '#1e293b', fontWeight: 500}}>Email Notifications</div>
                 <div style={{fontSize: '11px', color: '#94a3b8'}}>Receive booking alerts and guest messages via email</div>
               </div>
               <div style={{width: '36px', height: '20px', borderRadius: '10px', background: '#3b82f6', position: 'relative'}}>
                 <div style={{width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', right: '2px'}}></div>
               </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <div>
                 <div style={{fontSize: '13px', color: '#1e293b', fontWeight: 500}}>SMS Alerts</div>
                 <div style={{fontSize: '11px', color: '#94a3b8'}}>Immediate text messages for direct bookings</div>
               </div>
               <div style={{width: '36px', height: '20px', borderRadius: '10px', background: '#e2e8f0', position: 'relative'}}>
                 <div style={{width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: '2px'}}></div>
               </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <div>
                 <div style={{fontSize: '13px', color: '#1e293b', fontWeight: 500}}>Weekly Analytics Report</div>
                 <div style={{fontSize: '11px', color: '#94a3b8'}}>Get a summary of your traffic every Monday</div>
               </div>
               <div style={{width: '36px', height: '20px', borderRadius: '10px', background: '#3b82f6', position: 'relative'}}>
                 <div style={{width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', right: '2px'}}></div>
               </div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-title">Integrations</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div style={{border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px'}}>
               <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px'}}>
                 <div style={{fontSize: '14px', fontWeight: 600, color: '#1e293b'}}>Airbnb API</div>
                 <span style={{background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '10px'}}>Connected</span>
               </div>
               <div style={{fontSize: '12px', color: '#64748b'}}>Syncing 2 properties. Last sync: 14 mins ago.</div>
            </div>
            <div style={{border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px'}}>
               <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px'}}>
                 <div style={{fontSize: '14px', fontWeight: 600, color: '#1e293b'}}>Stripe (Direct Payments)</div>
                 <span style={{background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '10px'}}>Connected</span>
               </div>
               <div style={{fontSize: '12px', color: '#64748b'}}>Payouts active. Next payout: $280.00 on Jun 11.</div>
            </div>
            <div style={{border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', borderStyle: 'dashed'}}>
               <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                 <div style={{fontSize: '16px'}}>+</div>
                 <div style={{fontSize: '13px', fontWeight: 500, color: '#3b82f6'}}>Connect VRBO API</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


function DynamicField({ label, value, onChange }) {
  if (typeof value === 'string' || typeof value === 'number') {
    const isLong = typeof value === 'string' && (value.length > 50 || label.toLowerCase().includes('bio') || label.toLowerCase().includes('desc') || label.toLowerCase().includes('subtitle'));
    return (
      <div style={{marginBottom: '12px'}}>
        <label style={{display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{label}</label>
        {isLong ? (
          <textarea 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            style={{width: '100%', minHeight: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit'}} 
          />
        ) : (
          <input 
            type={typeof value === 'number' ? 'number' : 'text'} 
            value={value} 
            onChange={e => onChange(typeof value === 'number' ? Number(e.target.value) : e.target.value)} 
            style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px'}} 
          />
        )}
      </div>
    );
  }
  
  if (typeof value === 'boolean') {
    return (
      <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px', fontWeight: 500}}>
        <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} style={{width: '16px', height: '16px'}} />
        {label}
      </label>
    );
  }
  
  if (Array.isArray(value)) {
    return (
      <div style={{marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
        <label style={{display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '12px', textTransform: 'uppercase'}}>{label}</label>
        {value.map((item, idx) => (
          <div key={idx} style={{position: 'relative', padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>
            <button 
              onClick={(e) => { e.preventDefault(); const newArr = [...value]; newArr.splice(idx, 1); onChange(newArr); }} 
              style={{position: 'absolute', top: '8px', right: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px'}}
            >
              ✕
            </button>
            <DynamicField label={`Item ${idx+1}`} value={item} onChange={(newVal) => {
              const newArr = [...value]; newArr[idx] = newVal; onChange(newArr);
            }} />
          </div>
        ))}
        <button 
          onClick={(e) => {
            e.preventDefault();
            let emptyVal = '';
            if (value.length > 0) {
              if (typeof value[0] === 'object' && value[0] !== null) {
                emptyVal = Object.keys(value[0]).reduce((acc, k) => {
                  acc[k] = typeof value[0][k] === 'boolean' ? false : (typeof value[0][k] === 'number' ? 0 : '');
                  return acc;
                }, {});
              } else if (typeof value[0] === 'number') {
                emptyVal = 0;
              }
            } else {
              emptyVal = ''; 
            }
            onChange([...value, emptyVal]);
          }} 
          style={{padding: '8px 16px', fontSize: '13px', fontWeight: 500, color: '#3b82f6', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer'}}
        >
          + Add New {label}
        </button>
      </div>
    );
  }
  
  if (typeof value === 'object' && value !== null) {
    return (
      <div style={{marginBottom: '12px'}}>
        {label && !label.startsWith('Item ') && <label style={{display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px', textTransform: 'uppercase'}}>{label}</label>}
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {Object.entries(value).map(([k, v]) => (
            <DynamicField key={k} label={k} value={v} onChange={(newVal) => {
              onChange({ ...value, [k]: newVal });
            }} />
          ))}
        </div>
      </div>
    );
  }
  
  return null;
}

function DynamicForm({ data, onChange }) {
  return (
    <div style={{ width: '100%', maxWidth: '800px', background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      {Object.entries(data).map(([k, v]) => (
        <DynamicField key={k} label={k} value={v} onChange={(newVal) => {
          onChange({ ...data, [k]: newVal });
        }} />
      ))}
    </div>
  );
}

function SiteBuilderView({ property, propertiesData, setPropertiesData }) {
  const [activeLayout, setActiveLayout] = useState('unlocked')
  const [editingSection, setEditingSection] = useState(null)

  const propData = propertiesData[property] || propertiesData['The Littleton Tiny Home']
  if (!propData) return <div>Property data not found</div>
  
  const layouts = propData.layouts[activeLayout]

  const moveItem = (index, direction) => {
    if (direction === -1 && index === 0) return
    if (direction === 1 && index === layouts.length - 1) return

    const newLayouts = [...layouts]
    const temp = newLayouts[index]
    newLayouts[index] = newLayouts[index + direction]
    newLayouts[index + direction] = temp

    setPropertiesData({
      ...propertiesData,
      [property]: {
        ...propData,
        layouts: {
          ...propData.layouts,
          [activeLayout]: newLayouts
        }
      }
    })
  }

  const toggleVisibility = (index) => {
    const newLayouts = [...layouts]
    newLayouts[index] = { ...newLayouts[index], visible: !newLayouts[index].visible }
    
    setPropertiesData({
      ...propertiesData,
      [property]: {
        ...propData,
        layouts: {
          ...propData.layouts,
          [activeLayout]: newLayouts
        }
      }
    })
  }

  if (editingSection) {

    const sectionContent = propData.content[editingSection] || {};
    
    return (
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <button onClick={() => setEditingSection(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
          ← Back to layouts
        </button>
        <div className="page-title">Edit Content: {editingSection}</div>
        <div className="page-sub" style={{ marginBottom: '24px' }}>Modify the data driving this section</div>
        
        <DynamicForm 
          data={sectionContent} 
          onChange={(newData) => {
            setPropertiesData({
              ...propertiesData,
              [property]: {
                ...propData,
                content: {
                  ...propData.content,
                  [editingSection]: newData
                }
              }
            });
          }} 
        />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Site Builder</div>
          <div className="page-sub">Customize the guest view layout and content</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveLayout('unlocked')} 
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeLayout === 'unlocked' ? '#3b82f6' : '#e2e8f0', color: activeLayout === 'unlocked' ? 'white' : '#64748b', fontWeight: 500, cursor: 'pointer' }}
        >
          Unlocked View Layout
        </button>
        <button 
          onClick={() => setActiveLayout('booking')} 
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeLayout === 'booking' ? '#3b82f6' : '#e2e8f0', color: activeLayout === 'booking' ? 'white' : '#64748b', fontWeight: 500, cursor: 'pointer' }}
        >
          Booking View Layout
        </button>
      </div>

      <div style={{ maxWidth: '400px', margin: '0 auto', border: '12px solid #1e293b', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', height: '800px', position: 'relative' }}>
         <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '24px', background: '#1e293b', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', zIndex: 50 }}></div>
         <div style={{ height: '100%', overflowY: 'auto', background: '#f5f1ea', position: 'relative' }}>
           <GuestView 
             propertiesData={propertiesData}
             isPreviewMode={true}
             previewLayoutType={activeLayout}
             onMoveSection={(type, index, dir) => moveItem(index, dir)}
             onToggleVisibility={(type, index) => toggleVisibility(index)}
             onEditSection={(id) => setEditingSection(id)}
           />
         </div>
      </div>
    </>
  )
}
