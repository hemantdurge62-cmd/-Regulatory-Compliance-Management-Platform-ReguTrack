import React, { useState } from 'react';
import { login as loginApi } from '../api';

const DEMO = [
  { label: 'Admin',   email: 'admin@regutrack.com',   pwd: 'Admin@123',   color: '#ef4444' },
  { label: 'Officer', email: 'officer@regutrack.com', pwd: 'Officer@123', color: '#f59e0b' },
  { label: 'Viewer',  email: 'viewer@regutrack.com',  pwd: 'Viewer@123',  color: '#3b82f6' },
];

export default function Login({ onLogin }) {
  const [form, setForm]     = useState({ email: 'admin@regutrack.com', password: 'Admin@123' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await loginApi(form);
      onLogin(res.user, res.token);
    } catch (err) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'#060811',
      backgroundImage:`
        radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.2), transparent),
        radial-gradient(ellipse 40% 40% at 10% 90%, rgba(168,85,247,0.12), transparent),
        radial-gradient(ellipse 50% 50% at 90% 80%, rgba(6,182,212,0.06), transparent)`,
      padding:20,
    }}>
      {/* Animated bg orbs */}
      <div style={{position:'fixed',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',top:'10%',left:'15%',width:400,height:400,background:'rgba(99,102,241,0.06)',borderRadius:'50%',filter:'blur(80px)',animation:'float1 8s ease-in-out infinite'}}/>
        <div style={{position:'absolute',bottom:'15%',right:'10%',width:350,height:350,background:'rgba(168,85,247,0.05)',borderRadius:'50%',filter:'blur(80px)',animation:'float2 10s ease-in-out infinite'}}/>
      </div>

      <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:440}}>
        {/* Card */}
        <div style={{
          background:'rgba(13,17,23,0.92)',backdropFilter:'blur(32px)',
          border:'1px solid rgba(255,255,255,0.1)',borderRadius:24,
          padding:'44px 40px',
          boxShadow:'0 0 80px rgba(99,102,241,0.1), 0 32px 64px rgba(0,0,0,0.6)',
        }}>
          {/* Logo */}
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{
              width:60,height:60,margin:'0 auto 16px',borderRadius:16,
              background:'linear-gradient(135deg,#6366f1,#a855f7)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:26,boxShadow:'0 0 32px rgba(99,102,241,0.4)',
            }}>🛡️</div>
            <div style={{fontSize:24,fontWeight:900,letterSpacing:'-0.5px',color:'#f8fafc'}}>ReguTrack</div>
            <div style={{fontSize:13,color:'#64748b',marginTop:4}}>Compliance Management Platform</div>
          </div>

          {/* Divider with text */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
            <div style={{flex:1,height:1,background:'rgba(255,255,255,0.08)'}}/>
            <span style={{fontSize:12,color:'#475569',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px'}}>Sign in to continue</span>
            <div style={{flex:1,height:1,background:'rgba(255,255,255,0.08)'}}/>
          </div>

          {error && (
            <div style={{
              padding:'11px 16px',borderRadius:10,marginBottom:20,
              background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',
              color:'#f87171',fontSize:13,display:'flex',alignItems:'center',gap:8,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:'#64748b',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.5px'}}>Email Address</label>
              <input
                name="email" type="email" value={form.email} onChange={handle} required
                placeholder="you@company.com"
                style={{
                  width:'100%',padding:'11px 14px',borderRadius:10,
                  background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.1)',
                  color:'#f8fafc',fontSize:14,fontFamily:'Inter,sans-serif',
                  outline:'none',transition:'all 0.2s',
                }}
                onFocus={e=>{e.target.style.borderColor='#6366f1';e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)'}}
                onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.boxShadow='none'}}
              />
            </div>
            <div style={{marginBottom:28}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:'#64748b',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.5px'}}>Password</label>
              <div style={{position:'relative'}}>
                <input
                  name="password" type={showPwd?'text':'password'} value={form.password} onChange={handle} required
                  placeholder="••••••••"
                  style={{
                    width:'100%',padding:'11px 42px 11px 14px',borderRadius:10,
                    background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.1)',
                    color:'#f8fafc',fontSize:14,fontFamily:'Inter,sans-serif',
                    outline:'none',transition:'all 0.2s',
                  }}
                  onFocus={e=>{e.target.style.borderColor='#6366f1';e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)'}}
                  onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.boxShadow='none'}}
                />
                <button type="button" onClick={()=>setShowPwd(p=>!p)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#64748b',fontSize:16,padding:0,lineHeight:1}}>
                  {showPwd?'🙈':'👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width:'100%',padding:'12px',borderRadius:10,
              background:loading?'rgba(99,102,241,0.5)':'linear-gradient(135deg,#6366f1,#4f46e5)',
              color:'#fff',fontSize:15,fontWeight:700,fontFamily:'Inter,sans-serif',
              border:'none',cursor:loading?'not-allowed':'pointer',
              boxShadow:loading?'none':'0 4px 20px rgba(99,102,241,0.4)',
              transition:'all 0.2s',letterSpacing:'0.2px',
            }}>
              {loading ? '⏳ Signing in…' : '🔐 Sign In to ReguTrack'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{marginTop:28}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,0.06)'}}/>
              <span style={{fontSize:11,color:'#475569',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px'}}>Demo Accounts</span>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,0.06)'}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {DEMO.map(a => (
                <button key={a.label} onClick={() => setForm({ email: a.email, password: a.pwd })}
                  style={{
                    padding:'9px 6px',borderRadius:9,background:'rgba(255,255,255,0.03)',
                    border:`1px solid rgba(255,255,255,0.08)`,cursor:'pointer',
                    transition:'all 0.18s',fontFamily:'Inter,sans-serif',
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color+'55';e.currentTarget.style.background='rgba(255,255,255,0.06)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';e.currentTarget.style.background='rgba(255,255,255,0.03)'}}
                >
                  <div style={{fontSize:11,fontWeight:700,color:a.color,marginBottom:2}}>{a.label}</div>
                  <div style={{fontSize:10,color:'#475569'}}>Click to fill</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{textAlign:'center',fontSize:12,color:'#334155',marginTop:20}}>
          🔒 Secured with JWT Authentication
        </p>
      </div>

      <style>{`
        @keyframes float1{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-20px) scale(1.05)}}
        @keyframes float2{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(15px) scale(0.95)}}
      `}</style>
    </div>
  );
}
