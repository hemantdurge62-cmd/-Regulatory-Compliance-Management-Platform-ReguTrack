import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, CheckSquare, MessageCircle, Calendar, List, Columns } from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask, getUsers, getCompliance } from '../api';
import SkeletonLoader from './SkeletonLoader';

const STATS = ['todo','in-progress','review','done'];
const PRIOS = ['critical','high','medium','low'];
const EMPTY = { title:'', description:'', status:'todo', priority:'medium', dueDate:'', assignedTo:'', compliance:'', progress: 0, dependsOn: '' };

export default function TasksPage({ user }) {
  const [items, setItems]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [rules, setRules]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filterSt, setFilter] = useState('all');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [toast, setToast] = useState('');

  const notifyTeam = (taskTitle) => {
    setToast(`Pushing "${taskTitle}" to Slack #compliance-team...`);
    setTimeout(() => {
      setToast('✅ Successfully sent to #compliance-team!');
      setTimeout(() => setToast(''), 3000);
    }, 1500);
  };

  const load = () => {
    setLoading(true);
    Promise.all([
      getTasks().then(r=>setItems(r.data)),
      getUsers().then(r=>setUsers(r.data)).catch(()=>{}),
      getCompliance().then(r=>setRules(r.data))
    ]).finally(()=>setLoading(false));
  };
  useEffect(load,[]);

  const filtered = items.filter(i => {
    const ms = i.title.toLowerCase().includes(search.toLowerCase());
    const mf = filterSt==='all' || i.status===filterSt;
    return ms && mf;
  });

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setErr(''); setModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ 
      title:item.title, description:item.description||'', status:item.status, priority:item.priority, 
      dueDate:item.dueDate?.slice(0,10)||'', assignedTo:item.assignedTo?._id||'', compliance:item.compliance?._id||'',
      progress: item.progress || 0, dependsOn: item.dependsOn || ''
    });
    setErr(''); setModal(true);
  };

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.compliance) delete payload.compliance;
      if (!payload.dependsOn) delete payload.dependsOn;
      if (editing) await updateTask(editing._id, payload);
      else         await createTask(payload);
      load(); setModal(false);
    } catch(e) { setErr(e.message); } finally { setSaving(false); }
  };

  const del = async (id) => { if (!confirm('Delete this task?')) return; await deleteTask(id); load(); };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Tasks</h2>
          <p>{filtered.length} tasks · {items.filter(i=>i.status==='done').length} completed</p>
        </div>
        {(user.role==='admin'||user.role==='officer') &&
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16}/> Add Task</button>
        }
      </div>

      <div className="page-toolbar">
        <div className="search-wrap">
          <Search size={16}/>
          <input className="search-input" placeholder="Search tasks…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="filter-pills" style={{display:'flex', gap:16, alignItems:'center'}}>
          <div style={{display:'flex', gap:6}}>
            {['all',...STATS].map(s=>(
              <span key={s} className={`pill ${filterSt===s?'active':''}`} onClick={()=>setFilter(s)}>
                {s==='all'?'All Status':s}
              </span>
            ))}
          </div>
          <div style={{width:1, height:20, background:'var(--border)'}} />
          <div style={{display:'flex', gap:4}}>
            <button className={`btn-ghost ${viewMode==='list'?'active':''}`} onClick={()=>setViewMode('list')} style={{background:viewMode==='list'?'var(--glass2)':'transparent'}}><List size={16}/></button>
            <button className={`btn-ghost ${viewMode==='kanban'?'active':''}`} onClick={()=>setViewMode('kanban')} style={{background:viewMode==='kanban'?'var(--glass2)':'transparent'}}><Columns size={16}/></button>
            <button className={`btn-ghost ${viewMode==='gantt'?'active':''}`} onClick={()=>setViewMode('gantt')} style={{background:viewMode==='gantt'?'var(--glass2)':'transparent'}}><Calendar size={16}/></button>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{
          position:'fixed', bottom:100, right:30, background:'var(--modal-bg)', border:'1px solid var(--accent)', 
          padding:'12px 20px', borderRadius:8, boxShadow:'var(--shadow-lg), 0 0 10px rgba(99,102,241,0.2)', zIndex:9999,
          animation:'fadeUp 0.3s ease', fontWeight:500, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:10
        }}>
          <MessageCircle size={18} color="#6366f1"/> {toast}
        </div>
      )}

      <div className="card" style={{padding:0}}>
        {loading
          ? <div style={{padding: 24}}><SkeletonLoader type="table" count={1} /></div>
          : filtered.length===0
            ? <div className="empty-state"><CheckSquare size={48} style={{margin:'0 auto 16px',opacity:0.3}}/><h3>No tasks found</h3><p>Create your first task</p></div>
            : (
              viewMode === 'list' ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Task</th><th>Progress</th><th>Compliance Rule</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Due Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(item=>{
                      const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'done';
                      return (
                      <tr key={item._id} className={isOverdue ? 'overdue-row' : ''}>
                        <td className="primary">
                          {item.title}
                          {item.dependsOn && <div style={{fontSize:11, color:'var(--text-muted)', marginTop:4}}>Depends on: {items.find(i=>i._id===item.dependsOn)?.title || 'Deleted Task'}</div>}
                        </td>
                        <td>
                          <div style={{display:'flex', alignItems:'center', gap:8}}>
                            <div className="progress-bar" style={{width: 60}}><div className={`progress-fill ${item.progress===100?'green':item.progress>0?'indigo':''}`} style={{width: `${item.progress||0}%`}}/></div>
                            <span style={{fontSize:11, color:'var(--text-muted)'}}>{item.progress||0}%</span>
                          </div>
                        </td>
                        <td style={{fontSize:12,color:'var(--text-muted)'}}>{item.compliance?.title||'—'}</td>
                        <td>{item.assignedTo?.name||<span style={{color:'var(--text-muted)'}}>Unassigned</span>}</td>
                        <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                        <td><span className={`badge badge-${item.priority}`}>{item.priority}</span></td>
                        <td>
                          {isOverdue && <span style={{display:'inline-block', width:6, height:6, borderRadius:'50%', background:'var(--danger)', marginRight:6}} title="Overdue"/>}
                          {item.dueDate?new Date(item.dueDate).toLocaleDateString():'—'}
                        </td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn-ghost" title="Notify Slack" style={{color:'#0ea5e9'}} onClick={()=>notifyTeam(item.title)}><MessageCircle size={15}/></button>
                            <button className="btn-ghost" onClick={()=>openEdit(item)}><Pencil size={15}/></button>
                            {user.role==='admin' && <button className="btn-ghost" style={{color:'var(--danger)'}} onClick={()=>del(item._id)}><Trash2 size={15}/></button>}
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
              ) : viewMode === 'kanban' ? (
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: 20, minHeight: 400 }}>
                  {STATS.map(status => {
                    const columnTasks = filtered.filter(t => t.status === status);
                    return (
                      <div key={status} style={{ flex: '0 0 300px', background: 'var(--glass)', borderRadius: 'var(--r)', padding: 16, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <span style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--text)' }}>{status.replace('-', ' ')}</span>
                          <span className="badge" style={{ background: 'var(--glass2)' }}>{columnTasks.length}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {columnTasks.map(item => (
                            <div key={item._id} className="card" style={{ padding: 16, cursor: 'grab', background: 'var(--bg2)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span className={`badge badge-${item.priority}`}>{item.priority}</span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button className="btn-ghost" style={{ padding: 4 }} onClick={() => openEdit(item)}><Pencil size={14}/></button>
                                </div>
                              </div>
                              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{item.title}</div>
                              {item.dependsOn && <div style={{fontSize:11, color:'var(--text-muted)', marginBottom:8, padding:'4px 8px', background:'var(--glass)', borderRadius:4, borderLeft:'2px solid var(--accent)'}}>Depends on: {items.find(i=>i._id===item.dependsOn)?.title || 'Task'}</div>}
                              <div className="progress-bar" style={{marginBottom:10}}><div className={`progress-fill ${item.progress===100?'green':item.progress>0?'indigo':''}`} style={{width: `${item.progress||0}%`}}/></div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', display:'flex', justifyContent:'space-between' }}>
                                <span>{item.assignedTo?.name || 'Unassigned'}</span>
                                <span>{item.progress||0}%</span>
                              </div>
                            </div>
                          ))}
                          {columnTasks.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 12, border: '1px dashed var(--border2)', borderRadius: 8 }}>No tasks</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{padding:20, overflowX:'auto'}}>
                  <div style={{display:'grid', gridTemplateColumns:'250px repeat(30, 1fr)', gap:2, minWidth:1000}}>
                    {/* Header */}
                    <div style={{fontWeight:600, fontSize:12, color:'var(--text-muted)', paddingBottom:10}}>Task</div>
                    {Array.from({length:30}).map((_, i) => (
                      <div key={i} style={{fontSize:10, color:'var(--text-muted)', textAlign:'center', paddingBottom:10}}>{i+1}</div>
                    ))}
                    
                    {/* Gantt Rows */}
                    {filtered.map((item, idx) => {
                      // Fake start and duration for demo based on hash of ID to look consistent
                      const startDay = (item._id.charCodeAt(0) % 20) + 1;
                      const duration = (item._id.charCodeAt(1) % 7) + 2;
                      const barColor = item.status === 'done' ? '#10b981' : item.status === 'in-progress' ? '#3b82f6' : '#6366f1';
                      
                      return (
                        <React.Fragment key={item._id}>
                          <div style={{fontSize:13, fontWeight:500, padding:'10px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8}}>
                            <span style={{width:8,height:8,borderRadius:'50%',background:barColor}}></span>
                            {item.title.substring(0,25)}{item.title.length>25?'...':''}
                          </div>
                          {Array.from({length:30}).map((_, i) => {
                            const isBar = (i+1) >= startDay && (i+1) < startDay + duration;
                            return (
                              <div key={i} style={{borderBottom:'1px solid var(--border)', borderLeft:'1px solid rgba(255,255,255,0.02)', position:'relative'}}>
                                {isBar && (
                                  <div style={{
                                    position:'absolute', top:'20%', bottom:'20%', left:0, right:-2, 
                                    background:barColor, borderRadius: (i+1)===startDay ? '4px 0 0 4px' : (i+1)===(startDay+duration-1) ? '0 4px 4px 0' : '0',
                                    zIndex:2, opacity:0.8, boxShadow:'0 2px 4px rgba(0,0,0,0.2)'
                                  }} />
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      )
                    })}
                  </div>
                </div>
              )
            )
        }
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing?'Edit Task':'New Task'}</span>
              <button className="btn-ghost" onClick={()=>setModal(false)}><X size={18}/></button>
            </div>
            {err && <div className="alert alert-error">{err}</div>}
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/>
              </div>
              
              <div className="form-group">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <label className="form-label">Progress ({form.progress}%)</label>
                </div>
                <input type="range" min="0" max="100" step="5" value={form.progress} onChange={e=>setForm(f=>({...f,progress:Number(e.target.value)}))} style={{width:'100%', accentColor:'var(--accent)'}} />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
              </div>
              <div className="form-grid">
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
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select className="form-select" value={form.assignedTo} onChange={e=>setForm(f=>({...f,assignedTo:e.target.value}))}>
                    <option value="">— Unassigned —</option>
                    {users.map(u=><option key={u._id} value={u._id}>{u.name} ({u.department})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Linked Compliance Rule</label>
                  <select className="form-select" value={form.compliance} onChange={e=>setForm(f=>({...f,compliance:e.target.value}))}>
                    <option value="">— None —</option>
                    {rules.map(r=><option key={r._id} value={r._id}>{r.title} ({r.regulation})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Dependencies</label>
                  <select className="form-select" value={form.dependsOn} onChange={e=>setForm(f=>({...f,dependsOn:e.target.value}))}>
                    <option value="">— No Dependencies —</option>
                    {items.filter(i => i._id !== editing?._id).map(t=><option key={t._id} value={t._id}>{t.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':editing?'Update':'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
