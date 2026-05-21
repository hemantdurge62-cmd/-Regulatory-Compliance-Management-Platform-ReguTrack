import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { getCompliance, createCompliance, updateCompliance, deleteCompliance } from '../api';

const REGS  = ['GDPR','ISO 27001','SEBI','HIPAA','SOX','PCI-DSS'];
const CATS  = ['Data Privacy','Security','Financial','Operational','HR'];
const STATS = ['compliant','non-compliant','in-progress','pending'];
const PRIOS = ['critical','high','medium','low'];

const EMPTY = { title:'', regulation:'GDPR', category:'Data Privacy', description:'', control:'', status:'pending', priority:'medium', dueDate:'', department:'' };

export default function CompliancePage({ user }) {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [isSmart, setIsSmart]   = useState(false);
  const [filterSt, setFilterSt] = useState('all');
  const [filterPrio, setFilterPrio] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [filterReg, setFilterReg]= useState('all');
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState('');

  const load = () => {
    setLoading(true);
    getCompliance().then(r => setItems(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = items.filter(i => {
    let matchSearch = true;
    if (search) {
      if (isSmart) {
        // Simulated AI semantic search
        const q = search.toLowerCase();
        const keywords = [i.title, i.regulation, i.category, i.description, i.control, i.department].join(' ').toLowerCase();
        // Just check if any word from search is in keywords
        matchSearch = q.split(' ').some(word => word.length > 2 && keywords.includes(word));
      } else {
        matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.regulation.toLowerCase().includes(search.toLowerCase());
      }
    }
    const matchSt  = filterSt  === 'all' || i.status === filterSt;
    const matchReg = filterReg === 'all' || i.regulation === filterReg;
    const matchPrio = filterPrio === 'all' || i.priority === filterPrio;
    return matchSearch && matchSt && matchReg && matchPrio;
  });

  const getCrossWalk = (reg) => {
    if (reg === 'GDPR') return ['ISO 27001'];
    if (reg === 'ISO 27001') return ['SOC 2'];
    if (reg === 'HIPAA') return ['HITECH'];
    if (reg === 'PCI-DSS') return ['ISO 27001'];
    return [];
  };

  const heatmapData = (prio, st) => items.filter(i => i.priority === prio && i.status === st).length;

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setErr(''); setModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ title:item.title, regulation:item.regulation, category:item.category, description:item.description, control:item.control, status:item.status, priority:item.priority, dueDate: item.dueDate ? item.dueDate.slice(0,10) : '', department: item.department || '' }); setErr(''); setModal(true); };

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      if (editing) await updateCompliance(editing._id, form);
      else         await createCompliance(form);
      load(); setModal(false);
    } catch(e) { setErr(e.message); } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this compliance rule?')) return;
    await deleteCompliance(id); load();
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Compliance Rules</h2>
          <p>{filtered.length} rules · {items.filter(i=>i.status==='compliant').length} compliant</p>
        </div>
        {(user.role==='admin'||user.role==='officer') &&
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16}/> Add Rule</button>
        }
      </div>

      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="search-wrap" style={{display:'flex', gap:8}}>
          <div style={{position:'relative'}}>
            {isSmart ? <Sparkles size={16} style={{position:'absolute',left:12,top:10,color:'#a855f7'}}/> : <Search size={16} style={{position:'absolute',left:12,top:10,color:'var(--text3)'}} />}
            <input 
              className="search-input" 
              placeholder={isSmart ? "Ask in natural language..." : "Search rules…"} 
              value={search} onChange={e=>setSearch(e.target.value)} 
              style={{ borderColor: isSmart ? '#a855f7' : '' }}
            />
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsSmart(!isSmart)}
            style={{ color: isSmart ? '#a855f7' : '', borderColor: isSmart ? '#a855f7' : '' }}
            title="Toggle Smart Search AI"
          >
            <Sparkles size={14} /> {isSmart ? 'AI Search On' : 'Smart Search'}
          </button>
        </div>
        <div className="filter-pills" style={{display:'flex', gap:8, alignItems:'center'}}>
          <button 
            className={`btn-ghost ${showHeatmap?'active':''}`} 
            onClick={()=>setShowHeatmap(!showHeatmap)}
            style={{background:showHeatmap?'var(--glass2)':'transparent', border:'1px solid var(--border)', padding:'4px 12px', fontSize:12, borderRadius:99}}
          >
            🔥 Risk Heatmap
          </button>
          {['all','compliant','non-compliant','in-progress','pending'].map(s => (
            <span key={s} className={`pill ${filterSt===s?'active':''}`} onClick={()=>setFilterSt(s)}>
              {s==='all' ? 'All Status' : s}
            </span>
          ))}
        </div>
        <select className="form-select" style={{width:'auto',padding:'6px 12px'}} value={filterReg} onChange={e=>setFilterReg(e.target.value)}>
          <option value="all">All Regulations</option>
          {REGS.map(r=><option key={r}>{r}</option>)}
        </select>
      </div>

      {showHeatmap && (
        <div className="card" style={{marginBottom:24, padding:20, animation:'fadeUp 0.3s ease'}}>
          <div style={{fontWeight:600, marginBottom:16}}>Priority vs Status Risk Heatmap</div>
          <div style={{display:'grid', gridTemplateColumns:'80px repeat(4, 1fr)', gap:4}}>
            <div/>
            {STATS.map(s => <div key={s} style={{fontSize:11, color:'var(--text-muted)', textAlign:'center', textTransform:'capitalize'}}>{s}</div>)}
            {PRIOS.map(p => (
              <React.Fragment key={p}>
                <div style={{fontSize:11, color:'var(--text-muted)', textAlign:'right', paddingRight:10, alignSelf:'center', textTransform:'capitalize'}}>{p}</div>
                {STATS.map(s => {
                  const count = heatmapData(p, s);
                  const isRed = (p === 'critical' || p === 'high') && (s === 'non-compliant' || s === 'pending');
                  const isGreen = s === 'compliant';
                  const bg = count === 0 ? 'var(--input-bg)' : isRed ? `rgba(239,68,68,${0.2 + (count*0.1)})` : isGreen ? `rgba(16,185,129,${0.2 + (count*0.1)})` : `rgba(59,130,246,${0.2 + (count*0.1)})`;
                  const border = count === 0 ? 'var(--border)' : isRed ? '#ef4444' : isGreen ? '#10b981' : '#3b82f6';
                  const isSelected = filterPrio === p && filterSt === s;
                  return (
                    <div 
                      key={`${p}-${s}`}
                      onClick={() => {
                        if (isSelected) { setFilterPrio('all'); setFilterSt('all'); }
                        else { setFilterPrio(p); setFilterSt(s); }
                      }}
                      style={{
                        background: bg, border: `1px solid ${isSelected ? '#fff' : border}`, borderRadius: 6, height: 40,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        fontWeight: 600, color: count===0 ? 'var(--text-muted)' : '#fff', transition:'all 0.2s',
                        boxShadow: isSelected ? '0 0 0 2px var(--accent)' : 'none', opacity: count===0 ? 0.5 : 1
                      }}
                      title={`Click to filter: ${p} & ${s}`}
                    >
                      {count}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{padding:0}}>
        {loading
          ? <div className="loading-wrap"><div className="spinner"/></div>
          : filtered.length === 0
            ? <div className="empty-state"><ShieldCheck size={48} style={{margin:'0 auto 16px',opacity:0.3}}/><h3>No compliance rules found</h3><p>Add your first rule or adjust filters</p></div>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th><th>Regulation</th><th>Category</th><th>Dept.</th><th>Status</th><th>Priority</th><th>Due Date</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => (
                      <tr key={item._id}>
                        <td className="primary">{item.title}</td>
                        <td>
                          <span className="badge badge-scheduled">{item.regulation}</span>
                          {getCrossWalk(item.regulation).map(cw => (
                            <span key={cw} style={{display:'inline-block', marginLeft:6, fontSize:10, color:'#a855f7', background:'rgba(168,85,247,0.1)', padding:'2px 6px', borderRadius:10, border:'1px solid rgba(168,85,247,0.2)'}}>
                              + {cw}
                            </span>
                          ))}
                        </td>
                        <td style={{color:'var(--text-secondary)'}}>{item.category}</td>
                        <td style={{color:'var(--text-primary)', fontWeight:500}}>{item.department || '—'}</td>
                        <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                        <td><span className={`badge badge-${item.priority}`}>{item.priority}</span></td>
                        <td>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}</td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            {(user.role==='admin'||user.role==='officer') && <>
                              <button className="btn-ghost" onClick={()=>openEdit(item)} title="Edit"><Pencil size={15}/></button>
                              {user.role==='admin' && <button className="btn-ghost" style={{color:'var(--danger)'}} onClick={()=>del(item._id)} title="Delete"><Trash2 size={15}/></button>}
                            </>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Rule' : 'New Compliance Rule'}</span>
              <button className="btn-ghost" onClick={()=>setModal(false)}><X size={18}/></button>
            </div>
            {err && <div className="alert alert-error">{err}</div>}
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Regulation</label>
                  <select className="form-select" value={form.regulation} onChange={e=>setForm(f=>({...f,regulation:e.target.value}))}>
                    {REGS.map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                    {STATS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                    {PRIOS.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Internal Control *</label>
                <input className="form-input" value={form.control} onChange={e=>setForm(f=>({...f,control:e.target.value}))} required placeholder="e.g. Data Collection Policy v2.1" />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))} />
                </div>
                <div className="form-group">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <label className="form-label" style={{marginBottom:0}}>Department Owner</label>
                    <button type="button" className="btn-ghost" style={{padding:'2px 6px',fontSize:10,color:'#f59e0b',border:'1px solid rgba(245,158,11,0.3)',borderRadius:4}} onClick={() => {
                      // Auto-assign logic based on category
                      let dept = 'General';
                      if(form.category === 'HR') dept = 'HR';
                      else if(form.category === 'Financial') dept = 'Finance';
                      else if(form.category === 'Security') dept = 'IT';
                      else if(form.category === 'Data Privacy') dept = 'Legal';
                      else if(form.category === 'Operational') dept = 'Operations';
                      setForm(f=>({...f, department: dept}));
                    }}>
                      <Zap size={10} style={{marginRight:4}}/> Auto-Assign
                    </button>
                  </div>
                  <input className="form-input" value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))} placeholder="e.g. IT, HR, Finance" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create Rule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
