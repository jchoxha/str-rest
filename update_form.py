import re

with open('src/components/HostDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

dynamic_form_code = """
function DynamicForm({ data, onChange }) {
  const DynamicField = ({ label, value, onChange }) => {
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
  };

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

"""

if 'function DynamicForm(' not in content:
    content = content.replace('function SiteBuilderView(', dynamic_form_code + 'function SiteBuilderView(')

parts = content.split('  if (editingSection) {')
before_editing = parts[0]
after_editing_start = parts[1]

parts2 = after_editing_start.split('  return (\n    <>\n      <div className="page-header">')
editing_block = parts2[0]
after_editing = parts2[1]

new_editing_block = """
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

"""

new_content = before_editing + '  if (editingSection) {\n' + new_editing_block + '  return (\n    <>\n      <div className="page-header">' + after_editing

with open('src/components/HostDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Successfully replaced.")
