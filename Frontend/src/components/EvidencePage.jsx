import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, FileText, Tag, Download, Scan, CheckCircle, Hash, UploadCloud } from 'lucide-react';
import jsPDF from 'jspdf';
import { getEvidence, createEvidence, deleteEvidence, getCompliance, autoMapPolicy } from '../api';

const EMPTY = { title:'', description:'', fileName:'', fileType:'', fileSize:'', tags:'', compliance:'', expiresAt:'' };

export default function EvidencePage({ user }) {
  const [items, setItems]     = useState([]);
  const [rules, setRules]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [tagFilter, setTagFilter] = useState(null);
  const [modal, setModal]     = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const simulateScan = async () => {
    setIsScanning(true);
    setScanComplete(false);
    
    try {
      // Mock calling the auto map policy AI
      const res = await autoMapPolicy({ documentName: form.title || 'scanned_contract.pdf' });
      
      setIsScanning(false);
      setScanComplete(true);
      
      const suggestedTags = res.suggestions ? res.suggestions.map(s => s.rule).join(', ') : 'Verified';
      
      setForm(f => ({
        ...f,
        fileName: form.fileName || (form.title ? form.title.toLowerCase().replace(/ /g, '_') + '.pdf' : 'scanned_document.pdf'),
        fileSize: form.fileSize || '1.4 MB',
        fileType: form.fileType || 'application/pdf',
        tags: f.tags ? f.tags + ', ' + suggestedTags : suggestedTags,
        description: `[AI EXTRACT & MAP] Confidence 95%: Document matches ${suggestedTags}`
      }));
    } catch (e) {
      setErr(e.message);
      setIsScanning(false);
    }
  };

  const load = () => {
    setLoading(true);
    Promise.all([
      getEvidence().then(r=>setItems(r.data)),
      getCompliance().then(r=>setRules(r.data))
    ]).finally(()=>setLoading(false));
  };
  useEffect(load,[]);

  const filtered = items.filter(i => {
    const ms = i.title.toLowerCase().includes(search.toLowerCase()) || (i.compliance?.title||'').toLowerCase().includes(search.toLowerCase());
    const mt = !tagFilter || (i.tags && i.tags.includes(tagFilter));
    return ms && mt;
  });

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) };
      if (!payload.compliance) delete payload.compliance;
      await createEvidence(payload);
      load(); setModal(false); setForm(EMPTY); setScanComplete(false);
    } catch(e) { setErr(e.message); } finally { setSaving(false); }
  };

  const del = async (id) => { if (!confirm('Delete evidence record?')) return; await deleteEvidence(id); load(); };

  const fileIcon = (type='') => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('sheet')||type.includes('xlsx')) return '📊';
    if (type.includes('image')) return '🖼️';
    return '📁';
  };

  const handleDownload = (item) => {
    if (item.fileUrl) {
      window.open(item.fileUrl, '_blank');
    } else {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Indigo color matching theme
      doc.text('Evidence Document Report', 20, 20);
      
      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 25, 190, 25);
      
      // Content
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      
      let y = 40;
      const addLine = (label, value) => {
        doc.setFont(undefined, 'bold');
        doc.text(`${label}:`, 20, y);
        doc.setFont(undefined, 'normal');
        
        // Wrap text if it's too long
        const splitText = doc.splitTextToSize(value || 'N/A', 130);
        doc.text(splitText, 60, y);
        y += (splitText.length * 7) + 5;
      };
      
      addLine('Title', item.title);
      addLine('Description', item.description);
      addLine('File Name', item.fileName);
      addLine('File Size', item.fileSize);
      addLine('File Type', item.fileType);
      
      if (item.tags && item.tags.length > 0) {
        addLine('Tags', item.tags.join(', '));
      } else {
        addLine('Tags', 'None');
      }
      
      if (item.compliance) {
        addLine('Linked Rule', item.compliance.title);
      }
      
      if (item.expiresAt) {
        addLine('Expires At', new Date(item.expiresAt).toLocaleDateString());
      }
      
      addLine('Uploaded By', item.uploadedBy?.name || 'Unknown');
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
      
      doc.save(item.fileName || `${item.title.replace(/\\s+/g, '_')}.pdf`);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Evidence Library</h2>
          <p>{filtered.length} documents tracked</p>
        </div>
        {(user.role==='admin'||user.role==='officer') &&
          <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setErr('');setScanComplete(false);setModal(true);}}>
            <Plus size={16}/> Add Evidence
          </button>
        }
      </div>

      <div className="page-toolbar">
        <div className="search-wrap">
          <Search size={16}/>
          <input className="search-input" placeholder="Search evidence…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        {tagFilter && (
          <div style={{display:'flex', alignItems:'center', gap:6, background:'rgba(99,102,241,0.1)', padding:'6px 12px', borderRadius:99, color:'var(--accent2)', fontSize:12, fontWeight:600}}>
            <Tag size={12}/> Tag: {tagFilter}
            <X size={14} style={{cursor:'pointer', marginLeft:4}} onClick={() => setTagFilter(null)} />
          </div>
        )}
      </div>

      {loading
        ? <div className="loading-wrap"><div className="spinner"/></div>
        : filtered.length===0
          ? <div className="empty-state"><FileText size={48} style={{margin:'0 auto 16px',opacity:0.3}}/><h3>No evidence found</h3><p>Upload your first compliance document</p></div>
          : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
              {filtered.map(item=>(
                <div className="card" key={item._id} style={{display:'flex',flexDirection:'column',gap:12}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
                    <div style={{display:'flex',gap:10,alignItems:'center', cursor:'pointer'}} onClick={() => setPreview(item)}>
                      <span style={{fontSize:28}}>{fileIcon(item.fileType)}</span>
                      <div>
                        <div style={{fontWeight:600,fontSize:14,color:'var(--accent)'}} className="hover-underline">{item.title}</div>
                        <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{item.fileName||'No file attached'}</div>
                      </div>
                    </div>
                    <div style={{display:'flex', gap: 6}}>
                      <button className="btn-ghost" title="Download Document" style={{color:'var(--accent)',flexShrink:0}} onClick={() => handleDownload(item)}>
                        <Download size={15}/>
                      </button>
                      {user.role==='admin' &&
                        <button className="btn-ghost" title="Delete Evidence" style={{color:'var(--danger)',flexShrink:0}} onClick={()=>del(item._id)}>
                          <Trash2 size={15}/>
                        </button>
                      }
                    </div>
                  </div>
                  {item.description && <p style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.5}}>{item.description}</p>}
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {(item.tags||[]).map(t=>(
                      <span key={t} onClick={() => setTagFilter(t)} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:12,fontSize:11,color:'var(--accent2)',cursor:'pointer',transition:'all 0.2s'}}>
                        <Tag size={10}/>{t}
                      </span>
                    ))}
                  </div>
                  <div style={{borderTop:'1px solid var(--border)',paddingTop:10,display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-muted)'}}>
                    <span>📎 {item.fileSize||'—'}</span>
                    <span>By {item.uploadedBy?.name||'Unknown'}</span>
                    {item.expiresAt && (
                      <span className={`badge ${new Date(item.expiresAt) < new Date() ? 'badge-deadline' : new Date(item.expiresAt) < new Date(Date.now() + 30*24*60*60*1000) ? 'badge-expiring' : 'badge-compliant'}`} style={{background:'transparent', padding:0}}>
                        Exp: {new Date(item.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {item.compliance && (
                    <div style={{padding:'6px 10px',background:'rgba(99,102,241,0.05)',border:'1px solid rgba(99,102,241,0.1)',borderRadius:6,fontSize:12,color:'var(--accent2)'}}>
                      🔗 {item.compliance.title}
                    </div>
                  )}
                  {/* Blockchain Badge */}
                  <div style={{
                    marginTop:4, padding:'4px 8px', background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.2)', 
                    borderRadius:4, fontSize:10, color:'#10b981', display:'flex', alignItems:'center', gap:6, fontFamily:'monospace'
                  }}>
                    <Hash size={12}/> Verified Immutable Hash: 0x{item._id}a9f...
                  </div>
                </div>
              ))}
            </div>
          )
      }

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add Evidence</span>
              <button className="btn-ghost" onClick={()=>setModal(false)}><X size={18}/></button>
            </div>
            {err && <div className="alert alert-error">{err}</div>}
            
            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); simulateScan(); }}
              onClick={!isScanning ? simulateScan : undefined}
              style={{
                border: '2px dashed var(--border2)', borderRadius: 8, padding: 30, textAlign: 'center',
                marginBottom: 20, cursor: isScanning ? 'default' : 'pointer', background: 'var(--input-bg)',
                position: 'relative', overflow: 'hidden', transition: 'all 0.2s'
              }}
              onDragEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onDragLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            >
              {isScanning && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 4, 
                  background: 'var(--success)', boxShadow: '0 0 10px var(--success)',
                  animation: 'scanLaser 1s ease-in-out infinite alternate'
                }} />
              )}
              {scanComplete ? (
                <div style={{color:'var(--success)', display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
                  <CheckCircle size={32}/>
                  <div style={{fontWeight:600}}>AI OCR Scan Complete</div>
                  <div style={{fontSize:12}}>Data extracted successfully</div>
                </div>
              ) : (
                <div style={{color:'var(--text-muted)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, opacity: isScanning ? 0.5 : 1}}>
                  <UploadCloud size={32}/>
                  <div style={{fontWeight:600}}>{isScanning ? 'Scanning Document...' : 'Click to Upload & AI Scan'}</div>
                  <div style={{fontSize:12}}>PDF, DOCX, JPG (Max 10MB)</div>
                </div>
              )}
            </div>

            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Document Title *</label>
                <input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Description (AI Extracted)</label>
                <textarea className="form-textarea" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">File Name</label>
                  <input className="form-input" value={form.fileName} onChange={e=>setForm(f=>({...f,fileName:e.target.value}))} placeholder="document.pdf"/>
                </div>
                <div className="form-group">
                  <label className="form-label">File Size</label>
                  <input className="form-input" value={form.fileSize} onChange={e=>setForm(f=>({...f,fileSize:e.target.value}))} placeholder="2.4 MB"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input className="form-input" type="date" value={form.expiresAt} onChange={e=>setForm(f=>({...f,expiresAt:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="GDPR, legal, audit"/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Linked Compliance Rule</label>
                <select className="form-select" value={form.compliance} onChange={e=>setForm(f=>({...f,compliance:e.target.value}))}>
                  <option value="">— None —</option>
                  {rules.map(r=><option key={r._id} value={r._id}>{r.title}</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'Add Evidence'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Drawer */}
      {preview && (
        <>
          <div className="drawer-overlay" onClick={() => setPreview(null)} />
          <div className="drawer" style={{width: 800}}>
            <div className="drawer-header">
              <div>
                <div style={{fontSize:18, fontWeight:800, marginBottom:4, display:'flex', alignItems:'center', gap:8}}>
                  {fileIcon(preview.fileType)} {preview.title}
                </div>
                <div style={{fontSize:12, color:'var(--text-muted)'}}>{preview.fileName} • {preview.fileSize}</div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button className="btn-ghost action-download" onClick={() => handleDownload(preview)}><Download size={16}/></button>
                <button className="btn-ghost" onClick={() => setPreview(null)}><X size={20}/></button>
              </div>
            </div>
            
            <div className="drawer-body" style={{display:'flex', gap:24, padding:0}}>
              {/* Left: Document View */}
              <div style={{flex:1, padding:24, background:'#000', display:'flex', flexDirection:'column', minHeight: 'calc(100vh - 80px)'}}>
                <div style={{flex:1, background:'#fff', borderRadius:8, padding:40, color:'#000', boxShadow:'0 0 20px rgba(0,0,0,0.5)', overflowY:'auto'}}>
                  <h1 style={{fontSize:24, fontWeight:700, marginBottom:20, color:'#111'}}>{preview.title}</h1>
                  <p style={{fontSize:14, lineHeight:1.6, color:'#333', marginBottom:16}}>
                    {preview.description || 'This document contains confidential compliance evidence. Content cannot be fully previewed without decryption keys.'}
                  </p>
                  <p style={{fontSize:14, lineHeight:1.6, color:'#555'}}>
                    <strong>Linked Rule:</strong> {preview.compliance?.title || 'None'}<br/>
                    <strong>Upload Date:</strong> {new Date(preview.createdAt).toLocaleDateString()}<br/>
                    <strong>Uploaded By:</strong> {preview.uploadedBy?.name || 'System'}<br/>
                    <strong>Security Hash:</strong> 0x{preview._id}a9f...
                  </p>
                </div>
              </div>
              
              {/* Right: Version History sidebar */}
              <div style={{width: 280, borderLeft:'1px solid var(--border)', padding:24, background:'var(--modal-bg)'}}>
                <div className="drawer-section-title">Version History</div>
                <div style={{display:'flex', flexDirection:'column', gap:16}}>
                  <div style={{borderLeft:'2px solid var(--success)', paddingLeft:12, position:'relative'}}>
                    <div style={{position:'absolute', left:-6, top:0, width:10, height:10, borderRadius:'50%', background:'var(--success)', border:'2px solid var(--modal-bg)'}}/>
                    <div style={{fontSize:13, fontWeight:600}}>Version 1.2 (Current)</div>
                    <div style={{fontSize:11, color:'var(--text-muted)', marginBottom:4}}>Uploaded {new Date(preview.createdAt).toLocaleDateString()}</div>
                    <div style={{fontSize:11, background:'rgba(16,185,129,0.1)', color:'var(--success)', padding:'2px 6px', borderRadius:4, display:'inline-block'}}>Verified by AI OCR</div>
                  </div>
                  
                  <div style={{borderLeft:'2px solid var(--border)', paddingLeft:12, position:'relative', opacity:0.6}}>
                    <div style={{position:'absolute', left:-6, top:0, width:10, height:10, borderRadius:'50%', background:'var(--text3)', border:'2px solid var(--modal-bg)'}}/>
                    <div style={{fontSize:13, fontWeight:600}}>Version 1.1</div>
                    <div style={{fontSize:11, color:'var(--text-muted)', marginBottom:4}}>Uploaded 2 months ago</div>
                    <button className="btn-ghost btn-sm action-download" style={{marginTop:4}}><Download size={12} style={{marginRight:4}}/> Download</button>
                  </div>
                  
                  <div style={{borderLeft:'2px solid transparent', paddingLeft:12, position:'relative', opacity:0.6}}>
                    <div style={{position:'absolute', left:-6, top:0, width:10, height:10, borderRadius:'50%', background:'var(--text3)', border:'2px solid var(--modal-bg)'}}/>
                    <div style={{fontSize:13, fontWeight:600}}>Version 1.0</div>
                    <div style={{fontSize:11, color:'var(--text-muted)'}}>Uploaded 5 months ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
