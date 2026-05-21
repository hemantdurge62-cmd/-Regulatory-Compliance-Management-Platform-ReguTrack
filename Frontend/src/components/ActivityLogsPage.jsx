import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, FileText, User as UserIcon, RefreshCw } from 'lucide-react';
import { getLogs } from '../api';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getLogs();
      setLogs(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const uniqueUsers = Array.from(new Set(logs.map(l => l.user?.name).filter(Boolean)));
  const uniqueActions = Array.from(new Set(logs.map(l => l.action).filter(Boolean)));

  const filteredLogs = logs.filter(log => {
    const ma = filterAction === 'all' || log.action === filterAction;
    const mu = filterUser === 'all' || (log.user?.name === filterUser);
    return ma && mu;
  });

  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE': return 'var(--success)';
      case 'UPDATE': return 'var(--warning)';
      case 'DELETE': return 'var(--danger)';
      case 'LOGIN': return 'var(--accent)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap:'wrap', gap:16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Activity Logs</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Immutable audit trail of system activities</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="form-select" style={{width:'auto', padding:'6px 32px 6px 12px'}} value={filterAction} onChange={e=>setFilterAction(e.target.value)}>
            <option value="all">All Actions</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className="form-select" style={{width:'auto', padding:'6px 32px 6px 12px'}} value={filterUser} onChange={e=>setFilterUser(e.target.value)}>
            <option value="all">All Users</option>
            {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <button className="btn btn-primary" onClick={fetchLogs} disabled={loading} style={{padding:'6px 12px'}}>
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        {loading && !logs.length ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No logs match filters</td></tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log._id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 13 }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <UserIcon size={14} color="var(--accent)" />
                          {log.user?.name || 'System'}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: 12, 
                          fontWeight: 600, 
                          color: getActionColor(log.action),
                          background: `color-mix(in srgb, ${getActionColor(log.action)} 15%, transparent)`,
                          padding: '2px 8px',
                          borderRadius: 4
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                          <FileText size={14} color="var(--text-muted)" />
                          {log.resource}
                        </div>
                      </td>
                      <td style={{ fontSize: 14 }}>{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
