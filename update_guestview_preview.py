import re

with open('src/components/GuestView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace("import React, { useState } from 'react'", "import React, { useState, useEffect } from 'react'")

# 2. Update signature
old_sig = "export default function GuestView({ propertiesData }) {"
new_sig = """export default function GuestView({ 
  propertiesData, 
  isPreviewMode = false, 
  previewLayoutType = 'unlocked', 
  onMoveSection, 
  onToggleVisibility, 
  onEditSection 
}) {"""
content = content.replace(old_sig, new_sig)

# 3. Add useEffect and PreviewWrapper
effect_code = """
  useEffect(() => {
    if (isPreviewMode) {
      setViewState(previewLayoutType);
      setSubView(null);
    }
  }, [isPreviewMode, previewLayoutType]);

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
          <div style={{ background: 'white', padding: '8px', borderRadius: '8px', display: 'flex', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
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

content = content.replace('  const propData = (propertiesData && propertiesData["The Littleton Tiny Home"]) || {};', effect_code + '\n  const propData = (propertiesData && propertiesData["The Littleton Tiny Home"]) || {};')

# 4. Replace unlocked rendering
old_unlocked = """        {viewState === 'unlocked' && !subView && (
          <>
            {propData.layouts?.unlocked?.map(section => {
              if (!section.visible) return null;
              return renderSection(section.id, contentData);
            })}
          </>
        )}"""

new_unlocked = """        {viewState === 'unlocked' && !subView && (
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
        )}"""

content = content.replace(old_unlocked, new_unlocked)

# 5. Replace booking rendering
old_booking = """        {viewState === 'booking' && !subView && (
          <>
            {propData.layouts?.booking?.map(section => {
              if (!section.visible) return null;
              return renderSection(section.id, contentData);
            })}
          </>
        )}"""

new_booking = """        {viewState === 'booking' && !subView && (
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
        )}"""

content = content.replace(old_booking, new_booking)

content = content.replace("{viewState !== 'initial' && viewState !== 'passcode' && (", "{viewState !== 'initial' && viewState !== 'passcode' && !isPreviewMode && (")

with open('src/components/GuestView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("GuestView.jsx successfully updated")
