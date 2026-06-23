import re

with open('src/components/HostDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

if "import GuestView from './GuestView'" not in content:
    content = content.replace("import React, { useState } from 'react'", "import React, { useState } from 'react'\nimport GuestView from './GuestView'")

old_dash_card = """      <div className="dash-card" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {layouts.map((item, index) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: item.visible ? 'white' : '#f8fafc', opacity: item.visible ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button onClick={() => moveItem(index, -1)} disabled={index === 0} style={{ background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer', color: index === 0 ? '#cbd5e1' : '#64748b', padding: 0 }}>▲</button>
                  <button onClick={() => moveItem(index, 1)} disabled={index === layouts.length - 1} style={{ background: 'none', border: 'none', cursor: index === layouts.length - 1 ? 'default' : 'pointer', color: index === layouts.length - 1 ? '#cbd5e1' : '#64748b', padding: 0 }}>▼</button>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Section ID: {item.id}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => toggleVisibility(index)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>
                  {item.visible ? '👁️ Hide' : '🙈 Show'}
                </button>
                <button onClick={() => setEditingSection(item.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #3b82f6', background: '#eff6ff', fontSize: '12px', color: '#1d4ed8', cursor: 'pointer', fontWeight: 500 }}>
                  Edit Content
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>"""

new_dash_card = """      <div style={{ maxWidth: '400px', margin: '0 auto', border: '12px solid #1e293b', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', height: '800px', position: 'relative' }}>
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
      </div>"""

if old_dash_card in content:
    content = content.replace(old_dash_card, new_dash_card)
    with open('src/components/HostDashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("HostDashboard.jsx successfully updated")
else:
    print("Could not find the target block to replace.")

