import re

with open('src/components/GuestView.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

return_idx = -1
for i, line in enumerate(lines):
    if line.startswith('  return (') and lines[i+1].strip().startswith('<div'):
        return_idx = i
        break

if return_idx == -1:
    print("Could not find first return")
    exit(1)

before_return = "".join(lines[:return_idx])

old_sig = "export default function GuestView() {"
new_sig = """export default function GuestView({ 
  propertiesData, 
  isPreviewMode = false, 
  previewLayoutType = 'unlocked', 
  onMoveSection, 
  onToggleVisibility, 
  onEditSection 
}) {"""
if old_sig in before_return:
    before_return = before_return.replace(old_sig, new_sig)

if "useEffect" not in lines[0]:
    before_return = before_return.replace("import React, { useState } from 'react'", "import React, { useState, useEffect } from 'react'")

effect_code = """
  useEffect(() => {
    if (isPreviewMode) {
      setViewState(previewLayoutType);
      setSubView(null);
    }
  }, [isPreviewMode, previewLayoutType]);

  const propData = (propertiesData && propertiesData["The Littleton Tiny Home"]) || {};
  const contentData = propData.content || {};

  const PreviewWrapper = ({ children, section, index, isPreviewMode, onMove, onToggle, onEdit, isFirst, isLast }) => {
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
          <div style={{ background: 'white', padding: '8px', borderRadius: '8px', display: 'flex', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', pointerEvents: 'auto' }}>
            <button onClick={(e) => { e.stopPropagation(); onMove(-1); }} disabled={isFirst} style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: isFirst ? 'default' : 'pointer', opacity: isFirst ? 0.5 : 1 }}>▲</button>
            <button onClick={(e) => { e.stopPropagation(); onMove(1); }} disabled={isLast} style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: isLast ? 'default' : 'pointer', opacity: isLast ? 0.5 : 1 }}>▼</button>
            <button onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{section.visible ? '🙈 Hide' : '👁️ Show'}</button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{ padding: '6px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>✏️ Edit Content</button>
          </div>
        </div>
      </div>
    );
  };
"""

if "const propData = " not in before_return:
    before_return += effect_code


render_section_code = """
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
              <img src={data['about-hosts']?.portrait} alt={data['about-hosts']?.hostNames} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
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
"""

new_return = """
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
            <img src={propData.heroImage} alt="Property" />
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
            <img src={propData.heroImage} alt="Property" />
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
            <img src={propData.heroImage} alt="Property" />
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
              {error && <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>Incorrect passcode. Try 'mountains24' or your custom code.</div>}
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
                  <img src={contentData['about-hosts']?.portrait} alt={contentData['about-hosts']?.hostNames} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                
                {viewState === 'unlocked' && (!userPostId || editingPostId) && (
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
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {newPostImages.map((src, i) => (
                        <div key={i} style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden' }}>
                          <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Upload preview" />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label className="db-btn guestbook-upload-btn" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', background: '#e8e2d9', color: '#2c2820' }}>
                        Upload Images
                        <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                      </label>
                      <button type="submit" className="db-btn guestbook-submit-btn" style={{ flex: 2, margin: 0 }}>
                        {editingPostId ? 'Update Post' : 'Post to Guestbook'}
                      </button>
                    </div>
                  </form>
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
                        {userPostId === post.id && !editingPostId && (
                          <div className="guestbook-post-actions">
                            <button onClick={() => handleEditPost(post)} className="guestbook-action-btn">Edit</button>
                            <button onClick={() => handleDeletePost(post.id)} className="guestbook-action-btn delete">Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ padding: '16px 20px', textAlign: 'center', borderTop: '0.5px solid #e8e2d9' }}>
          <div style={{ fontSize: '10px', color: '#b0a89a', letterSpacing: '1px' }}>Powered by str.rest</div>
        </div>
      </div>
    </div>
  )
}
"""

with open('src/components/GuestView.jsx', 'w', encoding='utf-8') as f:
    f.write(before_return + render_section_code + new_return)

