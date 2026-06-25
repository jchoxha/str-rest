import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import GuestView from './GuestView'
import { useAuth } from '../auth/auth-context'
import { usePlan } from '../hooks/usePlan'
import { startCheckout, openPortal } from '../lib/billing'
import { listMyProperties, createProperty, updateProperty, deleteProperty, uploadImage } from '../lib/properties'

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

export default function HostDashboard() {
  const { user, signOut } = useAuth()
  const { isPro } = usePlan()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [activeTab, setActiveTab] = useState('Dashboard')

  useEffect(() => {
    let active = true
    listMyProperties()
      .then(rows => { if (active) setProperties(rows) })
      .catch(() => { if (active) setProperties([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const selectedProperty = properties.find(p => p.id === selectedId) || null

  // Optimistic local update + debounced, merged persistence (per column).
  const pendingRef = useRef({})
  const timerRef = useRef(null)
  const updateSelected = (patch) => {
    const id = selectedId
    if (!id) return
    setProperties(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)))
    pendingRef.current = { ...pendingRef.current, ...patch }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const toSave = pendingRef.current
      pendingRef.current = {}
      try { await updateProperty(id, toSave) } catch (e) { console.error('Save failed', e) }
    }, 600)
  }

  const handleCreate = async () => {
    // Free plan is limited to one property (the DB also enforces this).
    if (!isPro && properties.length >= 1) {
      if (window.confirm('The free plan is limited to 1 property. Upgrade to Pro for unlimited properties — continue to checkout?')) {
        try { await startCheckout() } catch (e) { alert(e.message) }
      }
      return
    }
    try {
      const created = await createProperty({ name: 'New property' })
      setProperties(prev => [created, ...prev])
      setSelectedId(created.id)
      setActiveTab('Property Details')
    } catch (e) {
      alert('Could not create property: ' + e.message)
    }
  }

  const handleDelete = async () => {
    if (!selectedProperty) return
    if (!window.confirm(`Delete "${selectedProperty.name}"? This cannot be undone.`)) return
    const id = selectedProperty.id
    try {
      await deleteProperty(id)
      setProperties(prev => prev.filter(p => p.id !== id))
      setSelectedId(null)
      setActiveTab('Dashboard')
    } catch (e) {
      alert('Could not delete: ' + e.message)
    }
  }

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
        return <SiteBuilderView property={selectedProperty} onChange={updateSelected} />
      case 'Analytics':
        return <AnalyticsView property={selectedProperty} isPro={isPro} />
      case 'Property Details':
        return <PropertyView property={selectedProperty} onChange={updateSelected} onDelete={handleDelete} isPro={isPro} />
      case 'Account':
        return <AccountBillingView isPro={isPro} email={user?.email} onSignOut={signOut} />
      case 'Dashboard':
      default:
        return <OverviewView property={selectedProperty} onChange={updateSelected} />
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', color: '#94a3b8' }}>
        Loading your properties…
      </div>
    )
  }

  if (!selectedProperty) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ color: 'white', fontSize: '36px', fontWeight: 700, letterSpacing: '-1px' }}>str.rest</div>
            <div style={{ fontSize: '15px', color: '#94a3b8', marginTop: '4px' }}>Your properties</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{user?.email}</div>
            <button onClick={signOut} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', padding: '4px 0' }}>Sign out</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          {properties.map((p) => (
            <div
              key={p.id}
              onClick={() => { setSelectedId(p.id); setActiveTab('Dashboard'); }}
              style={{ width: '280px', background: '#1e293b', borderRadius: '16px', padding: '24px', cursor: 'pointer', border: '1px solid #334155', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#3b82f6'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#334155'; }}
            >
              <div style={{ height: '120px', background: '#0f172a', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', overflow: 'hidden' }}>
                {p.hero_image ? <img src={p.hero_image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏠'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>{p.name}</div>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>{p.location || 'No location set'}</div>
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #334155', fontSize: '13px', color: p.published ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.published ? '#10b981' : '#64748b' }}></div>
                {p.published ? 'Published' : 'Draft'}
              </div>
            </div>
          ))}
          <div
            onClick={handleCreate}
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
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>{selectedProperty.name}</span>
            <button onClick={() => { setSelectedId(null); setActiveTab('Dashboard'); }} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Change</button>
          </div>
          {selectedProperty.published && (
            <Link to={`/p/${selectedProperty.slug}`} target="_blank" style={{ display: 'block', marginTop: '8px', fontSize: '11px', color: '#60a5fa', textDecoration: 'none' }}>
              View guest page ↗
            </Link>
          )}
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
          <div className="sb-label">Settings</div>
          <SidebarItem label="Account" icon={IconSettings} current={activeTab} onSelect={setActiveTab} />
        </div>

        <div className="sb-section" style={{ marginTop: 'auto' }}>
          <SidebarItem label="Sign out" onClick={signOut} current={activeTab} onSelect={setActiveTab} />
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

function OverviewView({ property, onChange }) {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{property.name}</div>
          <div className="page-sub">{property.published ? 'Published — live for guests' : 'Draft — not yet public'}</div>
        </div>
        <button className="pub-btn" onClick={() => onChange({ published: !property.published })}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {property.published ? 'Unpublish' : 'Publish'}
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

function UpgradeCard({ feature }) {
  return (
    <div className="dash-card" style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>{feature} is a Pro feature</div>
      <div style={{ fontSize: 13, color: '#64748b', margin: '8px 0 16px' }}>
        Upgrade to unlock {feature.toLowerCase()}, unlimited properties, and remove the str.rest badge.
      </div>
      <button className="pub-btn" onClick={() => startCheckout().catch(e => alert(e.message))}>Upgrade to Pro</button>
    </div>
  )
}

function AnalyticsView({ property, isPro }) {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-sub">{isPro ? property.name : 'See how your guest page is performing'}</div>
        </div>
      </div>
      {isPro ? (
        <div className="metrics">
          <div className="metric-card">
            <div className="metric-label">Guest page views</div>
            <div className="metric-val">{(property.views ?? 0).toLocaleString()}</div>
            <div className="metric-change">{property.published ? 'Live' : 'Not published yet'}</div>
          </div>
        </div>
      ) : (
        <UpgradeCard feature="Analytics" />
      )}
    </>
  )
}

function PropertyView({ property, onChange, onDelete, isPro }) {
  const [uploading, setUploading] = useState(false)
  const field = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }
  const lbl = { fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }

  const onHeroFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, property.id)
      onChange({ hero_image: url })
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{property.name} Details</div>
          <div className="page-sub">Property settings — changes save automatically</div>
        </div>
        <button className="pub-btn" onClick={() => onChange({ published: !property.published })}>
          {property.published ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      <div className="dash-grid">
        <div className="dash-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div className="dash-card-title">Basic Info</div>
          <div>
            <label style={lbl}>Display Name</label>
            <input type="text" value={property.name || ''} onChange={e => onChange({ name: e.target.value })} style={field} />
          </div>
          <div>
            <label style={lbl}>Location</label>
            <input type="text" value={property.location || ''} onChange={e => onChange({ location: e.target.value })} placeholder="City, State" style={field} />
          </div>
          <div>
            <label style={lbl}>Host name(s)</label>
            <input type="text" value={property.host_names || ''} onChange={e => onChange({ host_names: e.target.value })} placeholder="e.g. Alex & Jordan" style={field} />
          </div>
          <div>
            <label style={lbl}>Guest access code</label>
            <input type="text" value={property.access_code || ''} onChange={e => onChange({ access_code: e.target.value })} placeholder="Code guests enter to unlock home details" style={field} />
          </div>
        </div>

        <div className="dash-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div className="dash-card-title">Hero image</div>
          <div style={{ height: '160px', borderRadius: '12px', background: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
            {property.hero_image ? <img src={property.hero_image} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'No image yet'}
          </div>
          <label className="pub-btn" style={{ alignSelf: 'flex-start', cursor: 'pointer' }}>
            {uploading ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onHeroFile} disabled={uploading} />
          </label>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div className="dash-card-title" style={{ color: '#ef4444' }}>Danger zone</div>
            <button onClick={onDelete} style={{ padding: '8px 14px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
              Delete this property
            </button>
          </div>
        </div>
      </div>

      <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '820px', marginTop: '24px' }}>
        <div className="dash-card-title">Calendar sync (iCal)</div>
        {isPro ? (
          <>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Paste your Airbnb / Vrbo / Booking.com "export calendar" (iCal) links, one per line. Busy dates from these feeds show on your booking page.
            </div>
            <textarea
              key={property.id}
              defaultValue={(property.ical_urls || []).map(u => (typeof u === 'string' ? u : u?.url)).filter(Boolean).join('\n')}
              onBlur={e => onChange({ ical_urls: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
              placeholder="https://www.airbnb.com/calendar/ical/12345.ics"
              style={{ width: '100%', minHeight: '90px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontFamily: 'monospace', boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Saved when you click away from the box.</div>
          </>
        ) : (
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            🔒 Calendar sync is a Pro feature.{' '}
            <button onClick={() => startCheckout().catch(e => alert(e.message))} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Upgrade to Pro</button>
          </div>
        )}
      </div>
    </>
  )
}

function AccountBillingView({ isPro, email, onSignOut }) {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Account & Billing</div>
          <div className="page-sub">Manage your plan and account</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dash-card-title">Your plan</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{isPro ? 'Pro' : 'Free'}</span>
            <span style={{ background: isPro ? '#dcfce7' : '#f1f5f9', color: isPro ? '#166534' : '#64748b', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>
              {isPro ? 'Active' : 'No subscription'}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            {isPro
              ? 'Unlimited properties, no str.rest badge, iCal calendar sync, and analytics.'
              : 'Free includes 1 property. Upgrade to Pro for unlimited properties, no badge, iCal sync, and analytics.'}
          </div>
          {isPro ? (
            <button className="pub-btn" style={{ alignSelf: 'flex-start' }} onClick={() => openPortal().catch(e => alert(e.message))}>
              Manage billing
            </button>
          ) : (
            <button className="pub-btn" style={{ alignSelf: 'flex-start' }} onClick={() => startCheckout().catch(e => alert(e.message))}>
              Upgrade to Pro
            </button>
          )}
        </div>

        <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dash-card-title">Account</div>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Signed in as</div>
            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{email}</div>
          </div>
          <button onClick={onSignOut} style={{ alignSelf: 'flex-start', padding: '8px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
            Sign out
          </button>
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

function SiteBuilderView({ property, onChange }) {
  const [activeLayout, setActiveLayout] = useState('unlocked')
  const [editingSection, setEditingSection] = useState(null)

  const layoutsObj = property.layouts || { unlocked: [], booking: [] }
  const layouts = layoutsObj[activeLayout] || []

  const moveItem = (index, direction) => {
    if (direction === -1 && index === 0) return
    if (direction === 1 && index === layouts.length - 1) return

    const newLayouts = [...layouts]
    const temp = newLayouts[index]
    newLayouts[index] = newLayouts[index + direction]
    newLayouts[index + direction] = temp

    onChange({ layouts: { ...layoutsObj, [activeLayout]: newLayouts } })
  }

  const toggleVisibility = (index) => {
    const newLayouts = [...layouts]
    newLayouts[index] = { ...newLayouts[index], visible: !newLayouts[index].visible }
    onChange({ layouts: { ...layoutsObj, [activeLayout]: newLayouts } })
  }

  if (editingSection) {
    const sectionContent = (property.content && property.content[editingSection]) || {};

    return (
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <button onClick={() => setEditingSection(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
          ← Back to layouts
        </button>
        <div className="page-title">Edit Content: {editingSection}</div>
        <div className="page-sub" style={{ marginBottom: '24px' }}>Modify the data driving this section</div>

        <DynamicForm
          data={sectionContent}
          onChange={(newData) => onChange({ content: { ...property.content, [editingSection]: newData } })}
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
             property={property}
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
