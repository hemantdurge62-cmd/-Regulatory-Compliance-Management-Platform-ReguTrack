import React, { useState, useEffect } from 'react';
import { Search, Compass, Shield, Settings, FileText, CheckSquare, Activity, Command } from 'lucide-react';

export default function CommandPalette({ setPage }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  const actions = [
    { id: 'dashboard', title: 'Go to Dashboard', icon: <Compass size={18} />, action: () => setPage('dashboard') },
    { id: 'compliance', title: 'Go to Compliance', icon: <Shield size={18} />, action: () => setPage('compliance') },
    { id: 'tasks', title: 'Go to Tasks', icon: <CheckSquare size={18} />, action: () => setPage('tasks') },
    { id: 'reports', title: 'Go to Reports', icon: <FileText size={18} />, action: () => setPage('reports') },
    { id: 'logs', title: 'Go to Activity Logs', icon: <Activity size={18} />, action: () => setPage('logs') },
    { id: 'settings', title: 'Go to Settings', icon: <Settings size={18} />, action: () => setPage('settings') },
  ];

  const filtered = actions.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  const handleAction = (action) => {
    action();
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)} style={{ zIndex: 9999 }}>
      <div className="modal" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg2)', width: '100%', maxWidth: '600px', transform: 'translateY(-20vh)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <Search size={20} color="var(--text3)" style={{ marginRight: 12 }} />
          <input
            autoFocus
            placeholder="Type a command or search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 16, outline: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--glass)', padding: '4px 8px', borderRadius: 4, fontSize: 12, color: 'var(--text3)' }}>
            <Command size={12} /> K
          </div>
        </div>
        <div style={{ padding: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)' }}>No results found</div>
          ) : (
            filtered.map(a => (
              <div
                key={a.id}
                onClick={() => handleAction(a.action)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer',
                  borderRadius: 8, transition: 'background 0.1s', color: 'var(--text2)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass2)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}
              >
                {a.icon}
                <span style={{ fontWeight: 500 }}>{a.title}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
