import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchPublicProperty, unlockProperty, listPosts, addPost, fetchAvailability } from '../lib/properties'

function PreviewWrapper({ children, section, isPreviewMode, onMove, onToggle, onEdit, isFirst, isLast }) {
  if (!isPreviewMode) {
    if (!section.visible) return null;
    return children;
  }

  return (
    <div style={{ position: 'relative', opacity: section.visible ? 1 : 0.4, transition: 'opacity 0.2s', marginBottom: '16px' }} className="preview-section-wrapper">
      <div style={{ pointerEvents: 'none' }}>
        {children}
      </div>
      <div
        className="preview-overlay"
        style={{
          position: 'absolute', top: -8, left: -8, right: -8, bottom: -8,
          background: 'rgba(59, 130, 246, 0.05)', border: '2px dashed #3b82f6', borderRadius: '12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.2s', zIndex: 10, cursor: 'default'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0}
      >
        <div style={{ background: 'white', padding: '8px', borderRadius: '8px', display: 'flex', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <button onClick={(e) => { e.stopPropagation(); onMove(-1); }} disabled={isFirst} style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: isFirst ? 'default' : 'pointer', opacity: isFirst ? 0.5 : 1 }}>▲</button>
          <button onClick={(e) => { e.stopPropagation(); onMove(1); }} disabled={isLast} style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: isLast ? 'default' : 'pointer', opacity: isLast ? 0.5 : 1 }}>▼</button>
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{section.visible ? '🙈 Hide' : '👁️ Show'}</button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{ padding: '6px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>✏️ Edit Content</button>
        </div>
      </div>
    </div>
  );
}

// Map a guestbook_posts row (author, body, images, created_at) to the shape the
// guestbook UI renders (author, text, date, images).
function toPost(row) {
  return {
    id: row.id,
    author: row.author,
    text: row.body,
    date: row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'Just now',
    images: Array.isArray(row.images) ? row.images : [],
  };
}

// Expand iCal busy ranges ({start, end} as YYYY-MM-DD, end exclusive per iCal)
// into a Set of busy night date-strings.
function busyDateSet(busy) {
  const set = new Set();
  for (const b of busy || []) {
    if (!b?.start) continue;
    const d = new Date(b.start + 'T00:00:00');
    const end = new Date((b.end || b.start) + 'T00:00:00');
    while (d < end) {
      set.add(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
  }
  return set;
}

// Read-only availability: current + next month, busy nights marked.
function AvailabilityCalendar({ busy }) {
  const set = busyDateSet(busy);
  const today = new Date();
  const months = [0, 1].map(off => new Date(today.getFullYear(), today.getMonth() + off, 1));
  const todayStr = today.toISOString().slice(0, 10);
  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
      {months.map((m, mi) => {
        const year = m.getFullYear();
        const month = m.getMonth();
        const first = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        return (
          <div key={mi} style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#2c2820', marginBottom: '8px' }}>
              {m.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', textAlign: 'center' }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i} style={{ fontSize: '9px', color: '#b0a89a' }}>{d}</span>
              ))}
              {Array.from({ length: first }).map((_, i) => <span key={`e${i}`} />)}
              {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isBusy = set.has(ds);
                const isPast = ds < todayStr;
                return (
                  <span key={day} style={{
                    fontSize: '11px', padding: '4px 0', borderRadius: '4px',
                    background: isBusy ? '#f3e3e0' : 'transparent',
                    color: isBusy ? '#b91c1c' : isPast ? '#cfc8bd' : '#2c2820',
                    textDecoration: isBusy ? 'line-through' : 'none',
                  }}>{day}</span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function GuestView({
  property,
  isPreviewMode = false,
  previewLayoutType = 'unlocked',
  onMoveSection,
  onToggleVisibility,
  onEditSection,
}) {
  const { slug } = useParams();

  // Public route fetches the published property (secrets stripped) by slug;
  // unlocking swaps in the full content. Preview mode renders the in-memory
  // property the host is currently editing.
  const [publicData, setPublicData] = useState(null);
  const [unlockedData, setUnlockedData] = useState(null);
  const [loadState, setLoadState] = useState(isPreviewMode ? 'ready' : 'loading'); // loading | ready | notfound

  // The route keys this component by slug (see App.jsx), so each property
  // gets a fresh mount — no synchronous state reset needed here.
  useEffect(() => {
    if (isPreviewMode) return;
    let active = true;
    fetchPublicProperty(slug)
      .then((d) => {
        if (!active) return;
        setPublicData(d);
        setLoadState(d ? 'ready' : 'notfound');
      })
      .catch(() => { if (active) setLoadState('notfound'); });
    return () => { active = false; };
  }, [slug, isPreviewMode]);

  const propData = isPreviewMode ? (property || {}) : (unlockedData || publicData || {});
  const contentData = propData.content || {};

  const [internalViewState, setViewState] = useState('initial');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(null);
  const [internalSubView, setSubView] = useState(null);
  const [guestName] = useState(null);
  const [busy, setBusy] = useState([]);

  // Pull iCal busy dates for the booking calendar (public only; degrades to
  // empty if the property has no feeds / isn't Pro / the function is absent).
  useEffect(() => {
    if (isPreviewMode || !slug) return;
    let active = true;
    fetchAvailability(slug).then(b => { if (active) setBusy(b); });
    return () => { active = false; };
  }, [slug, isPreviewMode]);

  // Show the "Powered by str.rest" badge unless the owner is Pro (per the public
  // RPC). Hidden in the host's own preview.
  const showBadge = !isPreviewMode && publicData?.showBadge !== false;

  // In preview mode the view is driven entirely by props, so derive it during
  // render rather than syncing internal state in an effect.
  const viewState = isPreviewMode ? previewLayoutType : internalViewState;
  const subView = isPreviewMode ? null : internalSubView;

  const goToSub = (view) => { setSubView(view); window.scrollTo(0, 0); };
  const goBack = () => { setSubView(null); window.scrollTo(0, 0); };

  // Guestbook is backed by the database (per property).
  const [guestbookPosts, setGuestbookPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('');
  const [userPostId, setUserPostId] = useState(null);

  useEffect(() => {
    const id = propData.id;
    if (!id) return;
    let active = true;
    listPosts(id)
      .then((rows) => { if (active) setGuestbookPosts(rows.map(toPost)); })
      .catch(() => {});
    return () => { active = false; };
  }, [propData.id]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (isPreviewMode || !propData.id) return;
    if (!newPostText.trim() || !newPostAuthor.trim()) return;
    try {
      const saved = await addPost(propData.id, { author: newPostAuthor.trim(), body: newPostText.trim() });
      setGuestbookPosts([toPost(saved), ...guestbookPosts]);
      setUserPostId(saved.id);
      setNewPostText('');
      setNewPostAuthor('');
    } catch {
      setError(true);
    }
  };

  const handlePasscodeSubmit = async (e) => {
    e.preventDefault();
    if (isPreviewMode) { setViewState('unlocked'); return; }
    setError(false);
    try {
      const data = await unlockProperty(slug, passcode);
      if (data) {
        setUnlockedData(data);
        setViewState('unlocked');
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  };

  // Public route: show clear loading / not-found states.
  if (!isPreviewMode && loadState === 'loading') {
    return <div className="go-wrap"><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6559' }}>Loading…</div></div>;
  }
  if (!isPreviewMode && loadState === 'notfound') {
    return <div className="go-wrap"><div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center', color: '#6b6559' }}>
      <div style={{ fontSize: 20, fontWeight: 600, color: '#2c2820' }}>Stay not found</div>
      <div>This guidebook doesn't exist or isn't published.</div>
    </div></div>;
  }

  const renderSection = (id, data) => {
    switch (id) {
      case 'home-details':
        return (
          <div className="guest-section" key={id}>
            <div className="gs-label">Your home details</div>
            <div className="info-grid">
              {data['home-details']?.previewItems?.map((c, i) => (
                <div className="info-card" key={i}>
                  <div className="info-card-icon">{c.icon}</div>
                  <div className="info-card-label">{c.label}</div>
                  <div className="info-card-val">{c.val}</div>
                </div>
              ))}
            </div>
            <button className="section-link" onClick={() => goToSub('details')}>View all details →</button>
          </div>
        );
      case 'house-rules':
        return (
          <div className="guest-section" key={id}>
            <div className="gs-label">House rules</div>
            {data['house-rules']?.rules?.slice(0, data['house-rules'].previewCount || 4).map((rule, i) => (
              <div className="guestbook-item" key={i}>
                <div className="gb-bullet"></div>
                <div className="gb-text">{rule}</div>
              </div>
            ))}
            <button className="section-link" onClick={() => goToSub('rules')}>View all rules →</button>
          </div>
        );
      case 'shop':
        return (
          <div className="guest-section" key={id}>
            <div className="gs-label">Shop your stay</div>
            <div className="gs-title">{data.shop?.title}</div>
            <div className="gs-subtitle">{data.shop?.subtitle}</div>
            <div className="shop-grid">
              {data.shop?.items?.filter(i => !i.hiddenPreview).map((p, i) => (
                <div className="shop-item" key={i}>
                  <div className="shop-img">
                    {p.img ? <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.emoji}
                  </div>
                  <div className="shop-info">
                    <div className="shop-name">{p.name}</div>
                    <div className="shop-price">{p.price}</div>
                    <button className="shop-btn">Shop now</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="section-link" onClick={() => goToSub('shop')}>Browse all products →</button>
          </div>
        );
      case 'guestbook':
        return (
          <div className="guest-section" key={id}>
            <div className="gs-label">Virtual guestbook</div>
            <div className="gs-title">See what others are saying</div>
            <div className="guestbook-preview-list">
              {guestbookPosts.slice(0, 2).map(post => (
                <div className="guestbook-preview-card" key={post.id}>
                  <div className="guestbook-preview-text">"{post.text}"</div>
                  <div className="guestbook-preview-author">— {post.author}</div>
                </div>
              ))}
            </div>
            <button className="section-link" onClick={() => goToSub('guestbook')}>Read all entries {viewState === 'unlocked' ? '& Add your own' : ''}</button>
          </div>
        );
      case 'direct-booking':
        return (
          <div className="direct-book" style={{ marginTop: viewState === 'booking' ? '16px' : '0' }} key={id}>
            <div className="db-badge">{data['direct-booking']?.badge}</div>
            <div className="db-title">{data['direct-booking']?.title}</div>
            <div className="db-sub">{data['direct-booking']?.sub}</div>
            <button className="db-btn" onClick={() => goToSub('booking')}>{data['direct-booking']?.btnText}</button>
          </div>
        );
      case 'about-hosts':
        return (
          <div className="guest-section" key={id}>
            <div className="gs-label">Your Hosts</div>
            <div className="gs-title">Meet {data['about-hosts']?.hostNames}</div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
              {data['about-hosts']?.portrait && <img src={data['about-hosts']?.portrait} alt={data['about-hosts']?.hostNames} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: '#6b6559', lineHeight: '1.5' }}>
                  {data['about-hosts']?.shortBio}
                </div>
              </div>
            </div>
            <button className="section-link" onClick={() => goToSub('hosts')}>Read more about us →</button>
          </div>
        );
      case 'gallery':
        return (
          <div className="guest-section" key={id}>
            <div className="gs-label">Gallery</div>
            <div className="gs-title">Take a look around</div>
            <div className="gallery-grid">
              {data.gallery?.images?.slice(0, viewState === 'booking' ? 3 : 5).map((img, i) => (
                <div
                  key={i}
                  className={`gallery-cell${img.span ? ' gallery-span' : ''}`}
                  onClick={() => setGalleryOpen(i)}
                >
                  <img src={img.src} alt={img.alt} />
                  <div className="gallery-hover">
                    <span>View</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="section-link" onClick={() => goToSub('gallery')}>View full gallery →</button>
          </div>
        );
      case 'local-recos':
        return (
          <div className="guest-section" key={id}>
            <div className="gs-label">Local favorites</div>
            <div className="gs-title">Our recommendations</div>
            {data['local-recos']?.items?.filter(i => !i.hiddenPreview).map((r, i) => (
              <div className="reco-item" key={i}>
                <div className="reco-icon">{r.icon}</div>
                <div>
                  <div className="reco-name">{r.name}</div>
                  <div className="reco-desc">{r.desc}</div>
                  <span className="reco-tag">{r.tag}</span>
                </div>
              </div>
            ))}
            <button className="section-link" onClick={() => goToSub('recommendations')}>See all recommendations →</button>
          </div>
        );
      case 'other-listings':
        return (
          <div className="guest-section" key={id}>
            <div className="gs-label">Our other places</div>
            <div className="gs-title">Explore more stays</div>
            {data['other-listings']?.properties?.map((p, i) => (
              <div className="prop-card" key={i}>
                <div className="prop-img" style={{ padding: 0 }}>
                  <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="prop-info">
                  <div className="prop-name">{p.name}</div>
                  <div className="prop-loc">{p.loc}</div>
                  <div className="prop-rating">{p.rating}</div>
                  <div className="prop-price-tag">{p.price}</div>
                </div>
              </div>
            ))}
            <button className="section-link" onClick={() => goToSub('listings')}>Explore all listings →</button>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="go-wrap">
      <div className="guest-view">
        <div className="guest-header">
          <div className="gh-logo">str.rest</div>
          {viewState === 'unlocked' && guestName && <div className="gh-btn">Hi, {guestName}</div>}
        </div>

        {/* HERO */}
        {viewState === 'booking' && !subView && (
          <div className="hero-img">
            {propData.heroImage && <img src={propData.heroImage} alt="Property" />}
            <div className="hero-text">
              <div className="hero-title">{propData.name}</div>
              <div className="hero-sub">{propData.location}</div>
            </div>
            <div className="hero-actions">
              <div className="hero-icon">❤️</div>
              <div className="hero-icon">↗️</div>
            </div>
          </div>
        )}

        {viewState === 'unlocked' && !subView && (
          <div className="hero-img">
            {propData.heroImage && <img src={propData.heroImage} alt="Property" />}
            <div className="hero-text">
              <div className="hero-title">
                {guestName ? `Welcome, ${guestName}` : 'Welcome to'}
              </div>
              <div className="hero-sub">{guestName ? `to ${propData.name}` : propData.name}</div>
            </div>
          </div>
        )}

        {viewState !== 'initial' && viewState !== 'passcode' && !isPreviewMode && (
          <div className="tab-bar">
            <div className={`tab-item ${viewState === 'booking' ? 'active' : ''}`} onClick={() => { setViewState('booking'); setSubView(null); }}>Booking</div>
            <div className={`tab-item ${viewState === 'unlocked' ? 'active' : ''}`} onClick={() => { setViewState('passcode'); setSubView(null); }}>Unlocked</div>
          </div>
        )}

        {/* Initial / Passcode States */}
        {viewState === 'initial' && (
          <div className="hero-img" style={{ height: '50vh', marginTop: '16px' }}>
            {propData.heroImage && <img src={propData.heroImage} alt="Property" />}
            <div className="hero-text">
              <div className="hero-title">{propData.name}</div>
              <div className="hero-sub">{propData.location}</div>
            </div>
            <button className="hero-btn" onClick={() => setViewState('passcode')}>Unlock your stay</button>
          </div>
        )}

        {viewState === 'passcode' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c2820', marginBottom: '8px' }}>Unlock your stay</div>
            <div style={{ fontSize: '14px', color: '#6b6559', marginBottom: '32px', textAlign: 'center' }}>Enter the custom passcode sent to you by your host.</div>
            
            <form onSubmit={handlePasscodeSubmit} style={{ width: '100%', maxWidth: '300px' }}>
              <input 
                type="text" 
                className="bf-input" 
                placeholder="Enter passcode" 
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '18px', padding: '16px', background: error ? '#fef2f2' : 'white', borderColor: error ? '#ef4444' : '#e8e2d9' }}
              />
              {error && <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>Incorrect passcode. Please use the code your host sent you.</div>}
              <button type="submit" className="db-btn" style={{ width: '100%', marginTop: '16px' }}>Unlock</button>
            </form>
            <button onClick={() => setViewState('booking')} style={{ background: 'none', border: 'none', color: '#6b6559', fontSize: '14px', marginTop: '24px', cursor: 'pointer', textDecoration: 'underline' }}>Return to booking view</button>
          </div>
        )}

        {/* Lightbox */}
        {galleryOpen !== null && (
          <div className="gallery-lightbox" onClick={() => setGalleryOpen(null)}>
            <button className="lightbox-close" onClick={() => setGalleryOpen(null)}>✕</button>
            <img src={contentData.gallery?.images[galleryOpen]?.src} alt={contentData.gallery?.images[galleryOpen]?.alt} className="lightbox-img" />
            <div className="lightbox-caption">{contentData.gallery?.images[galleryOpen]?.alt}</div>
            <div className="lightbox-nav">
              <button className="lightbox-arrow" onClick={(e) => { e.stopPropagation(); setGalleryOpen((galleryOpen - 1 + contentData.gallery?.images.length) % contentData.gallery?.images.length); }}>‹</button>
              <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '12px' }}>{galleryOpen + 1} / {contentData.gallery?.images.length}</span>
              <button className="lightbox-arrow" onClick={(e) => { e.stopPropagation(); setGalleryOpen((galleryOpen + 1) % contentData.gallery?.images.length); }}>›</button>
            </div>
          </div>
        )}

        {/* DYNAMIC SECTIONS */}
        {viewState === 'unlocked' && !subView && (
          <>
            {propData.layouts?.unlocked?.map((section, index) => (
              <PreviewWrapper
                key={section.id}
                section={section}
                index={index}
                isPreviewMode={isPreviewMode}
                onMove={(dir) => onMoveSection && onMoveSection('unlocked', index, dir)}
                onToggle={() => onToggleVisibility && onToggleVisibility('unlocked', index)}
                onEdit={() => onEditSection && onEditSection(section.id)}
                isFirst={index === 0}
                isLast={index === (propData.layouts.unlocked.length - 1)}
              >
                {renderSection(section.id, contentData)}
              </PreviewWrapper>
            ))}
          </>
        )}

        {viewState === 'booking' && !subView && (
          <>
            {propData.layouts?.booking?.map((section, index) => (
              <PreviewWrapper
                key={section.id}
                section={section}
                index={index}
                isPreviewMode={isPreviewMode}
                onMove={(dir) => onMoveSection && onMoveSection('booking', index, dir)}
                onToggle={() => onToggleVisibility && onToggleVisibility('booking', index)}
                onEdit={() => onEditSection && onEditSection(section.id)}
                isFirst={index === 0}
                isLast={index === (propData.layouts.booking.length - 1)}
              >
                {renderSection(section.id, contentData)}
              </PreviewWrapper>
            ))}
          </>
        )}

        {/* ===== SUB-VIEWS ===== */}
        {subView && (
          <>
            <div className="subview-header">
              <button className="back-btn" onClick={goBack}>← Back</button>
            </div>

            {subView === 'details' && (
              <div className="guest-section">
                <div className="gs-label">Your home details</div>
                <div className="gs-title">Everything you need</div>
                <div className="info-grid">
                  {contentData['home-details']?.fullItems?.map((c, i) => (
                    <div className="info-card" key={i}>
                      <div className="info-card-icon">{c.icon}</div>
                      <div className="info-card-label">{c.label}</div>
                      <div className="info-card-val">{c.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subView === 'rules' && (
              <div className="guest-section">
                <div className="gs-label">House rules</div>
                <div className="gs-title">Please keep in mind</div>
                {contentData['house-rules']?.rules?.map((rule, i) => (
                  <div className="guestbook-item" key={i}>
                    <div className="gb-bullet"></div>
                    <div className="gb-text">{rule}</div>
                  </div>
                ))}
              </div>
            )}

            {subView === 'shop' && (
              <div className="guest-section">
                <div className="gs-label">Shop your stay</div>
                <div className="gs-title">{contentData.shop?.title}</div>
                <div className="gs-subtitle">{contentData.shop?.subtitle}</div>
                <div className="shop-grid">
                  {contentData.shop?.items?.map((p, i) => (
                    <div className="shop-item" key={i}>
                      <div className="shop-img">
                        {p.img ? <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.emoji}
                      </div>
                      <div className="shop-info">
                        <div className="shop-name">{p.name}</div>
                        <div className="shop-price">{p.price}</div>
                        <button className="shop-btn">Shop now</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subView === 'booking' && (
              <div className="guest-section">
                <div className="gs-label">Direct booking</div>
                <div className="gs-title">Reserve your next stay</div>
                <div className="gs-subtitle">Book directly with us and save 12% — no platform fees.</div>
                {busy.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div className="bf-label" style={{ marginBottom: '8px' }}>Availability</div>
                    <AvailabilityCalendar busy={busy} />
                  </div>
                )}
                <div className="booking-form">
                  <div className="bf-row">
                    <div className="bf-field">
                      <label className="bf-label">Check-in</label>
                      <input type="date" className="bf-input" />
                    </div>
                    <div className="bf-field">
                      <label className="bf-label">Check-out</label>
                      <input type="date" className="bf-input" />
                    </div>
                  </div>
                  <div className="bf-field">
                    <label className="bf-label">Guests</label>
                    <select className="bf-input">
                      <option>1 guest</option>
                      <option>2 guests</option>
                      <option>3 guests</option>
                      <option>4 guests</option>
                    </select>
                  </div>
                  <div className="bf-field">
                    <label className="bf-label">Full name</label>
                    <input type="text" className="bf-input" placeholder="Your name" />
                  </div>
                  <div className="bf-field">
                    <label className="bf-label">Email</label>
                    <input type="email" className="bf-input" placeholder="you@email.com" />
                  </div>
                  <div className="bf-summary">
                    <div className="bf-line"><span>$129 × 3 nights</span><span>$387</span></div>
                    <div className="bf-line"><span>Cleaning fee</span><span>$45</span></div>
                    <div className="bf-line bf-discount"><span>Direct booking discount (12%)</span><span>-$52</span></div>
                    <div className="bf-line bf-total"><span>Total</span><span>$380</span></div>
                  </div>
                  <button className="db-btn" style={{ width: '100%', marginTop: '12px' }}>Request to book</button>
                </div>
              </div>
            )}

            {subView === 'hosts' && (
              <div className="guest-section">
                <div className="gs-label">About your hosts</div>
                <div className="gs-title">Hi, we're {contentData['about-hosts']?.hostNames}</div>
                <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden', marginTop: '16px', marginBottom: '16px' }}>
                  {contentData['about-hosts']?.portrait && <img src={contentData['about-hosts']?.portrait} alt={contentData['about-hosts']?.hostNames} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ fontSize: '16px', color: '#2c2820', lineHeight: '1.6', marginBottom: '24px' }}>
                  {contentData['about-hosts']?.longBioParagraphs?.map((p, i) => (
                    <p key={i} style={{ marginBottom: i < contentData['about-hosts'].longBioParagraphs.length - 1 ? '16px' : '0' }}>{p}</p>
                  ))}
                </div>
                
                <div className="gs-title" style={{ fontSize: '18px', marginBottom: '12px' }}>A few of our favorite things</div>
                <div className="info-grid" style={{ marginBottom: '24px' }}>
                  {contentData['about-hosts']?.favorites?.map((f, i) => (
                    <div className="info-card" key={i}>
                      <div className="info-card-icon">{f.icon}</div>
                      <div className="info-card-label">{f.label}</div>
                      <div className="info-card-val">{f.val}</div>
                    </div>
                  ))}
                </div>

                <div className="gs-title" style={{ fontSize: '18px', marginBottom: '12px' }}>Our Life Up Here</div>
                <div className="gallery-grid">
                  {contentData['about-hosts']?.lifestyleImages?.map((img, i) => (
                    <div key={i} className={`gallery-cell${img.span ? ' gallery-span' : ''}`} onClick={() => setGalleryOpen(i)}>
                      <img src={img.src} alt={img.alt} />
                      <div className="gallery-hover"><span>View</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subView === 'gallery' && (
              <div className="guest-section">
                <div className="gs-label">Gallery</div>
                <div className="gs-title">Explore the space</div>
                <div className="gallery-grid">
                  {contentData.gallery?.images?.map((img, i) => (
                    <div key={i} className={`gallery-cell${img.span ? ' gallery-span' : ''}`} onClick={() => setGalleryOpen(i)}>
                      <img src={img.src} alt={img.alt} />
                      <div className="gallery-hover"><span>View</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subView === 'recommendations' && (
              <div className="guest-section">
                <div className="gs-label">Local favorites</div>
                <div className="gs-title">Our recommendations</div>
                {contentData['local-recos']?.items?.map((r, i) => (
                  <div className="reco-item" key={i}>
                    <div className="reco-icon">{r.icon}</div>
                    <div>
                      <div className="reco-name">{r.name}</div>
                      <div className="reco-desc">{r.desc}</div>
                      <span className="reco-tag">{r.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {subView === 'listings' && (
              <div className="guest-section">
                <div className="gs-label">Our other places</div>
                <div className="gs-title">Explore more stays</div>
                {contentData['other-listings']?.properties?.map((p, i) => (
                  <div className="prop-card" key={i}>
                    <div className="prop-img" style={{ padding: 0 }}>
                      <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="prop-info">
                      <div className="prop-name">{p.name}</div>
                      <div className="prop-loc">{p.loc}</div>
                      <div className="prop-rating">{p.rating}</div>
                      <div className="prop-price-tag">{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {subView === 'guestbook' && (
              <div className="guest-section">
                <div className="gs-label">Virtual Guestbook</div>
                <div className="gs-title">Notes from past guests</div>
                
                {viewState === 'unlocked' && !isPreviewMode && !userPostId && (
                  <form onSubmit={handlePostSubmit} className="guestbook-form">
                    <input
                      type="text"
                      className="bf-input"
                      placeholder="Your name"
                      value={newPostAuthor}
                      onChange={e => setNewPostAuthor(e.target.value)}
                    />
                    <textarea
                      className="bf-input guestbook-textarea"
                      placeholder="Share a memory or recommendation from your stay..."
                      value={newPostText}
                      onChange={e => setNewPostText(e.target.value)}
                    />
                    <button type="submit" className="db-btn guestbook-submit-btn" style={{ width: '100%', margin: 0 }}>
                      Post to Guestbook
                    </button>
                  </form>
                )}

                {userPostId && (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#6b6559', fontSize: '14px' }}>
                    Thanks for signing the guestbook! 🎉
                  </div>
                )}

                <div className="guestbook-list">
                  {guestbookPosts.map(post => (
                    <div className="guestbook-post-card" key={post.id}>
                      {post.images && post.images.length > 0 && (
                        <div className="guestbook-post-gallery">
                          {post.images.map((src, i) => (
                            <img key={i} src={src} alt={`Guest memory ${i+1}`} className="guestbook-post-img" />
                          ))}
                        </div>
                      )}
                      <div className="guestbook-post-content">
                        <div className="guestbook-post-text">"{post.text}"</div>
                        <div className="guestbook-post-meta">
                          <span className="guestbook-post-author">— {post.author}</span>
                          <span className="guestbook-post-date">{post.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {showBadge && (
          <div style={{ padding: '16px 20px', textAlign: 'center', borderTop: '0.5px solid #e8e2d9' }}>
            <div style={{ fontSize: '10px', color: '#b0a89a', letterSpacing: '1px' }}>Powered by str.rest</div>
          </div>
        )}
      </div>
    </div>
  )
}
