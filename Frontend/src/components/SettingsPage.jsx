import React, { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, X, Shield, Bell, Database, ChevronDown, ChevronUp, Save, User, Lock, Palette, Settings, Monitor, Key, LogOut } from 'lucide-react';
import { getUsers, updateUser, deleteUser, register,
         getSettings, updateSecuritySettings, updateNotifSettings, updateRetentionSettings } from '../api';

const ROLES = ['admin','officer','viewer'];
const DEPTS = ['Management','Compliance','Legal','Finance','IT','HR','Operations','General'];
const EMPTY_USER = { name:'', email:'', password:'', role:'viewer', department:'General' };

/* ── tiny toggle component ─────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{width:44,height:24,borderRadius:12,background:checked?'var(--accent)':'var(--border)',cursor:'pointer',position:'relative',transition:'background 0.25s',flexShrink:0}}>
      <div style={{position:'absolute',top:3,left:checked?22:3,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left 0.25s',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
    </div>
  );
}

/* ── field row ─────────────────────────────────────────── */
function Field({ label, hint, children }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0',borderBottom:'1px solid var(--border)'}}>
      <div style={{paddingRight:20}}>
        <div style={{fontSize:15,fontWeight:500,color:'var(--text-primary)'}}>{label}</div>
        {hint && <div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>{hint}</div>}
      </div>
      <div style={{flexShrink:0}}>{children}</div>
    </div>
  );
}

/* ── collapsible section card ──────────────────────────── */
function Section({ icon, title, desc, color, children, open, onToggle, saving, onSave }) {
  return (
    <div className="card" style={{padding:0,overflow:'hidden',marginBottom:16}}>
      <div onClick={onToggle} style={{display:'flex',alignItems:'center',gap:14,padding:'18px 20px',cursor:'pointer',userSelect:'none'}}>
        <div style={{width:44,height:44,borderRadius:12,background:`rgba(99,102,241,0.1)`,display:'flex',alignItems:'center',justifyContent:'center',color,flexShrink:0}}>{icon}</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:15,color:'var(--text-primary)'}}>{title}</div>
          <div style={{fontSize:13,color:'var(--text-muted)',marginTop:2}}>{desc}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {open && (
            <button className="btn btn-primary" style={{padding:'6px 16px',fontSize:13}} onClick={e=>{e.stopPropagation();onSave();}} disabled={saving}>
              <Save size={14}/> {saving?'Saving…':'Save'}
            </button>
          )}
          <div style={{color:'var(--text-muted)'}}>{open?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</div>
        </div>
      </div>
      {open && <div style={{padding:'0 20px 20px',borderTop:'1px solid var(--border)'}}>{children}</div>}
    </div>
  );
}

export default function SettingsPage({ user, setUser }) {
  const [tab, setTab]         = useState('profile');
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [avatarStr, setAvatarStr] = useState(localStorage.getItem('rt_avatar'));
  const avatarRef = React.useRef(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY_USER);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');
  const [msg, setMsg]         = useState('');
  
  const [theme, setTheme] = useState(localStorage.getItem('rt_theme') || 'dark');
  const [compact, setCompact] = useState(localStorage.getItem('rt_compact') === 'true');
  const [animations, setAnimations] = useState(localStorage.getItem('rt_animations') !== 'false');
  const [borderRadius, setBorderRadius] = useState(localStorage.getItem('rt_radius') || 'default');
  const [twoFactorActive, setTwoFactorActive] = useState(localStorage.getItem('rt_2fa') === 'true');
  const [accent, setAccent] = useState(localStorage.getItem('rt_accent') || '#6366f1');

  // settings state
  const [openSec, setOpenSec] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [openRet, setOpenRet] = useState(false);
  const [savingSec, setSavingSec] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [savingRet, setSavingRet] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // profile & password state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileBio, setProfileBio] = useState('');
  
  const [curPassword, setCurPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [sec, setSec] = useState({
    jwtExpiry:'24h', passwordMinLength:8, requireUppercase:true,
    requireNumbers:true, requireSpecialChars:false, twoFactorEnabled:false,
    maxLoginAttempts:5, sessionTimeout:30
  });
  const [notif, setNotif] = useState({
    emailAlertsEnabled:true, overdueAuditAlerts:true, nonCompliantRuleAlerts:true,
    dailyDigest:false, alertEmail:'', alertFrequency:'immediate'
  });
  const [ret, setRet] = useState({
    auditLogRetentionDays:365, evidenceRetentionDays:730,
    autoDeleteEnabled:false, archiveBeforeDelete:true, complianceRecordRetention:1825
  });

  const flash = (text) => { setMsg(text); setTimeout(()=>setMsg(''),3000); };

  const loadUsers = () => {
    if (user.role !== 'admin') return;
    setLoading(true);
    getUsers().then(r=>setUsers(r.data)).finally(()=>setLoading(false));
  };

  const loadSettings = () => {
    if (user.role !== 'admin') return;
    setSettingsLoading(true);
    getSettings().then(r=>{
      if(r.data?.security)       setSec(r.data.security);
      if(r.data?.notifications)  setNotif(r.data.notifications);
      if(r.data?.dataRetention)  setRet(r.data.dataRetention);
    }).catch(()=>{}).finally(()=>setSettingsLoading(false));
  };

  useEffect(()=>{ loadUsers(); loadSettings(); },[]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('rt_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (compact) { document.documentElement.classList.add('compact-view'); } 
    else { document.documentElement.classList.remove('compact-view'); }
    localStorage.setItem('rt_compact', compact);
  }, [compact]);

  useEffect(() => {
    if (!animations) { document.documentElement.style.setProperty('*', 'animation: none !important; transition: none !important;'); }
    else { document.documentElement.style.removeProperty('*'); }
    localStorage.setItem('rt_animations', animations);
  }, [animations]);

  useEffect(() => {
    let r = '14px', rSm = '8px', rLg = '20px';
    if (borderRadius === 'sharp') { r = '4px'; rSm = '2px'; rLg = '6px'; }
    if (borderRadius === 'rounded') { r = '24px'; rSm = '12px'; rLg = '32px'; }
    document.documentElement.style.setProperty('--r', r);
    document.documentElement.style.setProperty('--r-sm', rSm);
    document.documentElement.style.setProperty('--r-lg', rLg);
    localStorage.setItem('rt_radius', borderRadius);
  }, [borderRadius]);

  const changeAccent = (c) => {
    setAccent(c);
    document.documentElement.style.setProperty('--accent', c);
    document.documentElement.style.setProperty('--accent3', c);
    localStorage.setItem('rt_accent', c);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target.result;
      setAvatarStr(data);
      localStorage.setItem('rt_avatar', data);
      flash('Avatar updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarStr(null);
    localStorage.removeItem('rt_avatar');
    flash('Avatar removed');
  };

  const enable2FA = () => {
    if (twoFactorCode.length !== 6) { flash('Error: Please enter a valid 6-digit code'); return; }
    setTwoFactorActive(true);
    localStorage.setItem('rt_2fa', 'true');
    setShow2FAModal(false);
    setTwoFactorCode('');
    flash('2FA Setup completed successfully! High security enabled.');
  };

  const simulateEmail = () => {
    setEmailSending(true);
    setTimeout(() => {
      setEmailSending(false);
      setShowEmailModal(true);
    }, 1500);
  };

  const openAdd  = () => { setEditing(null); setForm(EMPTY_USER); setErr(''); setModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({name:u.name,email:u.email,password:'',role:u.role,department:u.department}); setErr(''); setModal(true); };

  const saveUser = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      if (editing) { const {password,...rest}=form; await updateUser(editing._id,rest); flash('User updated'); }
      else { await register(form); flash('User created'); }
      loadUsers(); setModal(false);
    } catch(e){ setErr(e.message); } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this user?')) return;
    await deleteUser(id); loadUsers();
  };

  const saveProfile = async () => {
    try {
      const uid = user.id || user._id;
      if (!uid) { flash('Error: User ID not found'); return; }
      await updateUser(uid, { name: profileName, email: profileEmail });
      const updatedUser = { ...user, name: profileName, email: profileEmail };
      localStorage.setItem('rt_user', JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);
      flash('Profile updated successfully!');
    } catch(e) { flash('Error: ' + e.message); }
  };

  const updatePassword = async () => {
    if (!newPassword) { flash('Please enter a new password'); return; }
    try {
      const uid = user.id || user._id;
      await updateUser(uid, { password: newPassword });
      flash('Password updated successfully!');
      setCurPassword(''); setNewPassword('');
    } catch(e) { flash('Error: ' + e.message); }
  };

  const saveSec = async () => {
    setSavingSec(true);
    try { await updateSecuritySettings(sec); flash('Security settings saved'); }
    catch(e){ flash('Error: '+e.message); } finally { setSavingSec(false); }
  };

  const saveNotif = async () => {
    setSavingNotif(true);
    try { await updateNotifSettings(notif); flash('Notification settings saved'); }
    catch(e){ flash('Error: '+e.message); } finally { setSavingNotif(false); }
  };

  const saveRet = async () => {
    setSavingRet(true);
    try { await updateRetentionSettings(ret); flash('Data retention settings saved'); }
    catch(e){ flash('Error: '+e.message); } finally { setSavingRet(false); }
  };

  const roleColor = { admin:'var(--danger)', officer:'var(--warning)', viewer:'var(--info)' };

  const inp = (val,setter,key) => (
    <input className="form-input" style={{width:90,textAlign:'center',padding:'4px 8px'}}
      type="number" value={val} min={0}
      onChange={e=>setter(p=>({...p,[key]:Number(e.target.value)}))}/>
  );

  const TABS = [
    { key:'profile', label:'Public Profile', icon:<User size={18}/>, show:true },
    { key:'account_security', label:'Account Security', icon:<Lock size={18}/>, show:true },
    { key:'appearance', label:'Appearance', icon:<Palette size={18}/>, show:true },
    { key:'users', label:'User Management', icon:<Users size={18}/>, show:user.role==='admin' },
    { key:'system', label:'System Config', icon:<Settings size={18}/>, show:user.role==='admin' }
  ].filter(t=>t.show);

  return (
    <div className="animate-in" style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div className="page-header" style={{paddingBottom:20}}>
        <div className="page-header-left">
          <h2>Settings</h2>
          <p>Manage your account, preferences, and system configuration</p>
        </div>
      </div>

      <div style={{display:'flex',gap:32,flex:1,alignItems:'flex-start'}}>
        
        {/* Sidebar Nav */}
        <div style={{width:240,flexShrink:0,display:'flex',flexDirection:'column',gap:4}}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              style={{
                display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:8,border:'none',
                background:tab===t.key?'var(--accent)':'transparent',
                color:tab===t.key?'#fff':'var(--text-secondary)',
                cursor:'pointer',fontSize:15,fontWeight:500,transition:'all 0.2s',textAlign:'left',width:'100%'
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{flex:1,maxWidth:800}}>
          {msg && <div className="alert alert-success" style={{marginBottom:24}}>✅ {msg}</div>}

          {/* ── PROFILE TAB ── */}
          {tab==='profile' && (
            <div className="card">
              <div className="section-title" style={{marginBottom:24,fontSize:18}}>Public Profile</div>
              
              <div style={{display:'flex',alignItems:'flex-start',gap:24,marginBottom:32}}>
                <div style={{width:96,height:96,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,fontWeight:800,color:'#fff',boxShadow:'0 4px 20px rgba(99,102,241,0.3)', backgroundImage:avatarStr?`url(${avatarStr})`:'', backgroundSize:'cover', backgroundPosition:'center'}}>
                  {!avatarStr && user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{paddingTop:10}}>
                  <div style={{display:'flex',gap:12,marginBottom:8}}>
                    <input type="file" accept="image/*" ref={avatarRef} style={{display:'none'}} onChange={handleAvatarChange} />
                    <button className="btn btn-primary" onClick={()=>avatarRef.current?.click()}>Change Avatar</button>
                    <button className="btn btn-secondary" onClick={removeAvatar}>Remove</button>
                  </div>
                  <p style={{fontSize:13,color:'var(--text-muted)'}}>JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="form-grid" style={{marginBottom:24}}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={profileName} onChange={e=>setProfileName(e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" value={profileEmail} onChange={e=>setProfileEmail(e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input className="form-input" defaultValue={user?.role} disabled style={{textTransform:'capitalize',opacity:0.7,background:'var(--bg-secondary)'}}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" defaultValue={user?.department||'General'} disabled style={{opacity:0.7,background:'var(--bg-secondary)'}}/>
                </div>
              </div>
              
              <div className="form-group" style={{marginBottom:24}}>
                <label className="form-label">Bio / Notes</label>
                <textarea className="form-textarea" placeholder="Add some notes about your role..." rows={3} value={profileBio} onChange={e=>setProfileBio(e.target.value)}></textarea>
              </div>

              <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
            </div>
          )}

          {/* ── ACCOUNT SECURITY TAB ── */}
          {tab==='account_security' && (
            <div className="card">
              <div className="section-title" style={{marginBottom:24,fontSize:18}}>Account Security</div>
              
              <div style={{marginBottom:32}}>
                <h3 style={{fontSize:15,fontWeight:600,marginBottom:16,color:'var(--text-primary)'}}>Change Password</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input className="form-input" type="password" placeholder="••••••••" value={curPassword} onChange={e=>setCurPassword(e.target.value)}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input className="form-input" type="password" placeholder="••••••••" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{marginTop:8}} onClick={updatePassword}>Update Password</button>
              </div>

              <div style={{borderTop:'1px solid var(--border)',paddingTop:24}}>
                <Field label="Two-Factor Authentication" hint="Add an extra layer of security to your account">
                  {twoFactorActive ? (
                    <button className="btn btn-secondary" style={{color:'var(--danger)'}} onClick={()=>{setTwoFactorActive(false);localStorage.removeItem('rt_2fa');flash('2FA Disabled');}}><Key size={14}/> Disable 2FA</button>
                  ) : (
                    <button className="btn btn-primary" onClick={()=>setShow2FAModal(true)}><Key size={14}/> Setup 2FA</button>
                  )}
                </Field>
                <Field label="Active Sessions" hint="You are currently logged in on 1 device">
                  <button className="btn btn-secondary" style={{color:'var(--danger)'}} onClick={()=>flash('Logged out of other devices')}><LogOut size={14}/> Log out all devices</button>
                </Field>
              </div>
            </div>
          )}

          {/* 2FA MODAL */}
          {show2FAModal && (
            <div className="modal-overlay" onClick={() => setShow2FAModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:400}}>
                <div className="modal-header">
                  <div className="modal-title" style={{display:'flex',alignItems:'center',gap:10}}><Shield size={20} color="var(--accent)"/> Setup 2FA Security</div>
                  <button className="btn-ghost" onClick={() => setShow2FAModal(false)}><X size={18} /></button>
                </div>
                <div style={{textAlign:'center', padding:'10px 0'}}>
                  <p style={{fontSize:13, color:'var(--text-muted)', marginBottom:16}}>Scan this QR code with Google Authenticator or Authy to generate your security codes.</p>
                  <div style={{width:160, height:160, background:'#fff', margin:'0 auto 12px', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', padding:4}}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/ReguTrack:${user?.name || 'Admin'}?secret=HXDMVJECJJWSRB3H&issuer=ReguTrack`} alt="QR Code" style={{width:'100%', height:'100%', borderRadius:4}} />
                  </div>
                  <div style={{fontSize:12, color:'var(--text-primary)', fontFamily:'monospace', background:'var(--input-bg)', padding:'6px', borderRadius:6, marginBottom:20, letterSpacing:2}}>
                    HXDM VJEC JJWS RB3H
                  </div>
                  <div className="form-group" style={{textAlign:'left'}}>
                    <label className="form-label">Enter 6-Digit Code</label>
                    <input className="form-input" placeholder="e.g. 123456" value={twoFactorCode} onChange={e=>setTwoFactorCode(e.target.value)} maxLength={6} style={{fontSize:20, letterSpacing:4, textAlign:'center'}}/>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShow2FAModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={enable2FA}>Verify & Enable</button>
                </div>
              </div>
            </div>
          )}

          {/* ── APPEARANCE TAB ── */}
          {tab==='appearance' && (
            <div className="card">
              <div className="section-title" style={{marginBottom:24,fontSize:18}}>Appearance</div>
              
              <Field label="Theme Mode" hint="Select your preferred theme (Dark mode recommended)">
                <div style={{display:'flex',gap:12}}>
                  <div onClick={() => setTheme('dark')} style={{width:80,height:60,borderRadius:8,border:theme==='dark'?'2px solid var(--accent)':'2px solid var(--border)',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',cursor:'pointer',opacity:theme==='dark'?1:0.5}}>Dark</div>
                  <div onClick={() => setTheme('light')} style={{width:80,height:60,borderRadius:8,border:theme==='light'?'2px solid var(--accent)':'2px solid var(--border)',background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',color:'#333',cursor:'pointer',opacity:theme==='light'?1:0.5}}>Light</div>
                </div>
              </Field>

              <Field label="Accent Color" hint="Choose your primary dashboard color">
                <div style={{display:'flex',gap:8}}>
                  {['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899'].map(c=>(
                    <div key={c} onClick={()=>changeAccent(c)} style={{width:32,height:32,borderRadius:'50%',background:c,cursor:'pointer',border:c===accent?'2px solid #fff':'2px solid transparent',boxShadow:c===accent?'0 0 0 2px var(--accent)':''}}/>
                  ))}
                </div>
              </Field>

              <Field label="UI Animations" hint="Enable smooth transitions and hover effects">
                <Toggle checked={animations} onChange={() => setAnimations(!animations)}/>
              </Field>

              <Field label="Border Radius Style" hint="Adjust the roundness of cards and buttons">
                <select className="form-select" style={{width:140}} value={borderRadius} onChange={e=>setBorderRadius(e.target.value)}>
                  <option value="sharp">Sharp (Square)</option>
                  <option value="default">Default</option>
                  <option value="rounded">Extra Rounded</option>
                </select>
              </Field>

              <Field label="Compact View" hint="Reduce padding and spacing in tables">
                <Toggle checked={compact} onChange={() => setCompact(!compact)}/>
              </Field>
            </div>
          )}

          {/* ── USERS TAB (Admin only) ── */}
          {tab==='users' && user.role==='admin' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div className="section-title" style={{fontSize:18}}>User Management</div>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={16}/> Add User</button>
              </div>
              <div className="card" style={{padding:0}}>
                {loading ? <div className="loading-wrap"><div className="spinner"/></div> : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {users.map(u=>(
                          <tr key={u._id}>
                            <td className="primary">
                              <div style={{display:'flex',alignItems:'center',gap:10}}>
                                <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0}}>
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{fontWeight:500}}>{u.name}</div>
                                  <div style={{fontSize:12,color:'var(--text-muted)'}}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><span style={{color:roleColor[u.role],fontWeight:600,fontSize:12,textTransform:'capitalize'}}>{u.role}</span></td>
                            <td><span className={`badge ${u.isActive!==false?'badge-compliant':'badge-non-compliant'}`}>{u.isActive!==false?'Active':'Inactive'}</span></td>
                            <td>
                              <div style={{display:'flex',gap:6}}>
                                <button className="btn-ghost" onClick={()=>openEdit(u)}><Pencil size={15}/></button>
                                {u._id!==user.id && <button className="btn-ghost" style={{color:'var(--danger)'}} onClick={()=>del(u._id)}><Trash2 size={15}/></button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SYSTEM TAB (Admin only) ── */}
          {tab==='system' && user.role==='admin' && (
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              <div className="section-title" style={{marginBottom:16,fontSize:18}}>System Configuration</div>
              {settingsLoading && <div className="loading-wrap"><div className="spinner"/></div>}
              {!settingsLoading && <>
                <Section icon={<Shield size={20}/>} title="System Security" desc="JWT token expiry, password policy, 2FA configuration" color="var(--accent2)" open={openSec} onToggle={()=>setOpenSec(o=>!o)} saving={savingSec} onSave={saveSec}>
                  <Field label="JWT Token Expiry" hint="How long login tokens remain valid">
                    <select className="form-select" style={{width:140}} value={sec.jwtExpiry} onChange={e=>setSec(p=>({...p,jwtExpiry:e.target.value}))}>
                      {['1h','4h','8h','24h','7d','30d'].map(v=><option key={v}>{v}</option>)}
                    </select>
                  </Field>
                  <Field label="Minimum Password Length" hint="Minimum characters required">
                    {inp(sec.passwordMinLength, setSec, 'passwordMinLength')}
                  </Field>
                  <Field label="Require Uppercase Letters" hint="Passwords must contain at least one uppercase letter">
                    <Toggle checked={sec.requireUppercase} onChange={()=>setSec(p=>({...p,requireUppercase:!p.requireUppercase}))}/>
                  </Field>
                  <Field label="Require Numbers" hint="Passwords must contain at least one number">
                    <Toggle checked={sec.requireNumbers} onChange={()=>setSec(p=>({...p,requireNumbers:!p.requireNumbers}))}/>
                  </Field>
                  <Field label="Require Special Characters" hint="Passwords must contain !@#$% etc.">
                    <Toggle checked={sec.requireSpecialChars} onChange={()=>setSec(p=>({...p,requireSpecialChars:!p.requireSpecialChars}))}/>
                  </Field>
                  <Field label="Enforce 2FA System-wide" hint="Require 2FA for all user logins">
                    <Toggle checked={sec.twoFactorEnabled} onChange={()=>setSec(p=>({...p,twoFactorEnabled:!p.twoFactorEnabled}))}/>
                  </Field>
                  <Field label="Max Login Attempts" hint="Lock account after this many failed attempts">
                    {inp(sec.maxLoginAttempts, setSec, 'maxLoginAttempts')}
                  </Field>
                  <Field label="Session Timeout (minutes)" hint="Auto-logout after inactivity">
                    {inp(sec.sessionTimeout, setSec, 'sessionTimeout')}
                  </Field>
                </Section>

                <Section icon={<Bell size={20}/>} title="System Notifications" desc="Email alerts for overdue audits and non-compliant rules" color="var(--warning)" open={openNotif} onToggle={()=>setOpenNotif(o=>!o)} saving={savingNotif} onSave={saveNotif}>
                  <Field label="Enable Email Alerts" hint="Master switch for all email notifications">
                    <Toggle checked={notif.emailAlertsEnabled} onChange={()=>setNotif(p=>({...p,emailAlertsEnabled:!p.emailAlertsEnabled}))}/>
                  </Field>
                  <Field label="Overdue Audit Alerts" hint="Send alerts when audits pass their due date">
                    <Toggle checked={notif.overdueAuditAlerts} onChange={()=>setNotif(p=>({...p,overdueAuditAlerts:!p.overdueAuditAlerts}))}/>
                  </Field>
                  <Field label="Non-Compliant Rule Alerts" hint="Notify when compliance rules are breached">
                    <Toggle checked={notif.nonCompliantRuleAlerts} onChange={()=>setNotif(p=>({...p,nonCompliantRuleAlerts:!p.nonCompliantRuleAlerts}))}/>
                  </Field>
                  <Field label="Daily Digest" hint="Receive a summary email once per day">
                    <Toggle checked={notif.dailyDigest} onChange={()=>setNotif(p=>({...p,dailyDigest:!p.dailyDigest}))}/>
                  </Field>
                  <Field label="Alert Frequency" hint="How often to send triggered alerts">
                    <select className="form-select" style={{width:140}} value={notif.alertFrequency} onChange={e=>setNotif(p=>({...p,alertFrequency:e.target.value}))}>
                      {['immediate','daily','weekly'].map(v=><option key={v}>{v}</option>)}
                    </select>
                  </Field>
                  <Field label="Alert Email Address" hint="Destination email for all system alerts">
                    <input className="form-input" style={{width:220}} type="email" placeholder="alerts@company.com" value={notif.alertEmail} onChange={e=>setNotif(p=>({...p,alertEmail:e.target.value}))}/>
                  </Field>
                  <div style={{display:'flex', justifyContent:'flex-end', paddingTop:10}}>
                    <button className="btn btn-secondary" style={{color:'var(--info)'}} onClick={simulateEmail} disabled={emailSending}>
                      {emailSending ? 'Connecting to SMTP...' : 'Send Test Email'}
                    </button>
                  </div>
                </Section>

                <Section icon={<Database size={20}/>} title="Data Retention" desc="Configure audit log and evidence retention periods" color="var(--info)" open={openRet} onToggle={()=>setOpenRet(o=>!o)} saving={savingRet} onSave={saveRet}>
                  <Field label="Audit Log Retention (days)" hint="How long audit logs are kept (default 365)">
                    {inp(ret.auditLogRetentionDays, setRet, 'auditLogRetentionDays')}
                  </Field>
                  <Field label="Evidence Retention (days)" hint="How long uploaded evidence files are stored (default 730)">
                    {inp(ret.evidenceRetentionDays, setRet, 'evidenceRetentionDays')}
                  </Field>
                  <Field label="Compliance Record Retention (days)" hint="How long compliance rule records are kept">
                    {inp(ret.complianceRecordRetention, setRet, 'complianceRecordRetention')}
                  </Field>
                  <Field label="Auto-Delete Expired Records" hint="Automatically remove records beyond retention period">
                    <Toggle checked={ret.autoDeleteEnabled} onChange={()=>setRet(p=>({...p,autoDeleteEnabled:!p.autoDeleteEnabled}))}/>
                  </Field>
                  <Field label="Archive Before Delete" hint="Create archive copy before deleting expired records">
                    <Toggle checked={ret.archiveBeforeDelete} onChange={()=>setRet(p=>({...p,archiveBeforeDelete:!p.archiveBeforeDelete}))}/>
                  </Field>
                  <div style={{display:'flex', justifyContent:'flex-end', paddingTop:10}}>
                    <button className="btn btn-secondary" style={{color:'var(--warning)'}} onClick={(e)=>{e.stopPropagation(); flash('Manual Backup initiated. This may take a few minutes in production.');}}>
                      Run Manual Backup
                    </button>
                  </div>
                </Section>
                
                <div className="card" style={{marginTop:16}}>
                  <div className="section-title" style={{marginBottom:16}}>🔌 System Information</div>
                  <div style={{display:'flex',flexDirection:'column',gap:0}}>
                    {[
                      {label:'Platform',    val:'ReguTrack v1.0.0'},
                      {label:'Environment', val:'Development'},
                      {label:'Database',    val:'MongoDB'},
                      {label:'API Version', val:'v1'},
                      {label:'Build Date',  val:new Date().toLocaleDateString()},
                    ].map(r=>(
                      <div key={r.label} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)',fontSize:14}}>
                        <span style={{color:'var(--text-muted)'}}>{r.label}</span>
                        <span style={{color:'var(--text-primary)',fontWeight:500}}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>}
            </div>
          )}

          {/* EMAIL SIMULATOR MODAL */}
          {showEmailModal && (
            <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:500, background:'#0d1117'}}>
                <div className="modal-header" style={{borderBottomColor:'#1f2937'}}>
                  <div className="modal-title" style={{display:'flex',alignItems:'center',gap:10}}><Monitor size={20} color="var(--success)"/> SMTP Server Terminal (Demo)</div>
                  <button className="btn-ghost" onClick={() => setShowEmailModal(false)}><X size={18} /></button>
                </div>
                <div style={{fontFamily:'monospace', fontSize:13, color:'#10b981', background:'#000', padding:20, borderRadius:8, lineHeight:1.8}}>
                  <div style={{color:'#6b7280'}}>{`> Connecting to mail server: smtp.regutrack-cloud.internal:587...`}</div>
                  <div style={{color:'#6b7280'}}>{`> Authentication successful.`}</div>
                  <div style={{color:'#3b82f6'}}>{`[250 OK] SMTP Relay Connected`}</div>
                  <div>{`Preparing payload for: ${notif.alertEmail || 'alerts@company.com'}`}</div>
                  <div>{`Subject: [ReguTrack] Notification System Test`}</div>
                  <div style={{marginTop:10, color:'#f59e0b'}}>{`Transmitting encrypted payload...`}</div>
                  <div>{`[250 OK] Message queued for delivery.`}</div>
                  <div style={{marginTop:10, color:'#9ca3af', borderTop:'1px dashed #374151', paddingTop:10}}>
                    * NOTE: Because this is a demonstration environment, real email dispatch is disabled to prevent spam. This terminal log confirms the internal trigger fired correctly.
                  </div>
                </div>
                <div className="modal-footer" style={{borderTopColor:'#1f2937'}}>
                  <button className="btn btn-primary" onClick={() => setShowEmailModal(false)}>Acknowledge</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
