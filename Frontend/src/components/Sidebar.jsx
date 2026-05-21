import React from 'react';
import { LayoutDashboard, ShieldCheck, ClipboardList, CheckSquare, FileText, BarChart2, Settings, LogOut, Zap } from 'lucide-react';

const NAV = [
  { key: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard, section: 'OVERVIEW' },
  { key: 'compliance', label: 'Compliance Rules', icon: ShieldCheck,     section: 'MODULES' },
  { key: 'audits',     label: 'Audits',           icon: ClipboardList,   section: 'MODULES' },
  { key: 'tasks',      label: 'Tasks',            icon: CheckSquare,     section: 'MODULES' },
  { key: 'evidence',   label: 'Evidence',         icon: FileText,        section: 'MODULES' },
  { key: 'reports',    label: 'Reports',          icon: BarChart2,       section: 'ANALYTICS' },
  { key: 'logs',       label: 'Activity Logs',    icon: ShieldCheck,     section: 'SYSTEM' },
  { key: 'settings',   label: 'Settings',         icon: Settings,        section: 'SYSTEM' },
];

export default function Sidebar({ page, setPage, user, onLogout }) {
  const [avatarStr, setAvatarStr] = React.useState(null);
  
  React.useEffect(() => {
    // simple poll to catch cross-component updates in demo mode
    const interval = setInterval(() => {
      setAvatarStr(localStorage.getItem('rt_avatar'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  let lastSection = '';
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🛡️</div>
        <div className="logo-text">
          <h2>ReguTrack</h2>
          <span>Compliance Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ key, label, icon: Icon, section }) => {
          const showLabel = section !== lastSection;
          lastSection = section;
          return (
            <React.Fragment key={key}>
              {showLabel && <div className="nav-section-label">{section}</div>}
              <div
                className={`nav-item ${page === key ? 'active' : ''}`}
                onClick={() => setPage(key)}
                title={label}
              >
                <Icon size={20} />
                <span style={{flex:1}}>{label}</span>
                {page === key && (
                  <div style={{width:6,height:6,borderRadius:'50%',background:'var(--accent2)',boxShadow:'0 0 6px var(--accent)'}}/>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Status indicator */}
      <div style={{margin:'0 10px 8px',padding:'10px 12px',borderRadius:10,background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.15)',display:'flex',alignItems:'center',gap:8}}>
        <Zap size={13} color="#10b981" />
        <span style={{fontSize:11,color:'#10b981',fontWeight:600}}>System Online</span>
        <div style={{marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:'#10b981',animation:'pulse 2s infinite'}}/>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar" style={avatarStr ? {backgroundImage:`url(${avatarStr})`, backgroundSize:'cover', backgroundPosition:'center', color:'transparent'} : {}}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <div className="user-info-name">{user?.name}</div>
          <div className="user-info-role" style={{color:'var(--accent2)',fontWeight:600}}>{user?.role}</div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
