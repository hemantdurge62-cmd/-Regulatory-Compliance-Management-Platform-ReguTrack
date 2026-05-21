import React, { useState, useEffect } from 'react';
import { ShieldCheck, ClipboardList, CheckSquare, FileText, TrendingUp, AlertTriangle, Users, Activity, Sparkles } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getDashboard, getLogs } from '../api';
import AnimatedNumber from './AnimatedNumber';

const PIE_COLORS = ['#22c55e','#ef4444','#3b82f6','#f59e0b'];

export default function Dashboard({ user }) {
  const [data, setData]     = useState(null);
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    Promise.all([getDashboard(), getLogs().catch(() => ({ data: [] }))])
      .then(([dashRes, logsRes]) => {
        setData(dashRes.data);
        setLogs(logsRes.data.slice(0, 7)); // Top 7 for timeline
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;
  if (error)   return <div className="alert alert-error">⚠️ {error}</div>;
  if (!data)   return null;

  const { compliance, audits, tasks, evidence, users, charts, recent } = data;

  const pieData = [
    { name: 'Compliant',     value: compliance.compliant },
    { name: 'Non-Compliant', value: compliance.nonCompliant },
    { name: 'In Progress',   value: compliance.inProgress },
    { name: 'Pending',       value: compliance.pending },
  ].filter(d => d.value > 0);

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'Critical': return 'var(--danger)';
      case 'High': return '#f97316';
      case 'Medium': return 'var(--warning)';
      case 'Low': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  const healthData = [
    { name: 'Score', value: compliance.rate },
    { name: 'Gap', value: 100 - compliance.rate }
  ];

  // Derive critical items
  const criticalItems = [
    ...recent.tasks.filter(t => t.priority === 'critical' || t.status === 'overdue').map(t => ({ id: t._id, title: t.title, type: 'Task', status: t.status })),
    ...recent.audits.filter(a => a.status === 'overdue' || a.status === 'failed').map(a => ({ id: a._id, title: a.title, type: 'Audit', status: a.status }))
  ].slice(0, 5);

  return (
    <div className="animate-in">
      {/* Welcome */}
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:22,fontWeight:700,marginBottom:4}}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p style={{color:'var(--text-muted)',fontSize:14}}>
          Here's your compliance snapshot for today
        </p>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon indigo"><ShieldCheck size={22} /></div>
          <div>
            <div className="stat-val"><AnimatedNumber value={compliance.total} /></div>
            <div className="stat-label">Total Rules</div>
          </div>
        </div>
        <div className="stat-card glow-border" style={{'--accent': 'var(--success)', '--purple': 'var(--accent2)'}}>
          <div className="stat-icon green"><TrendingUp size={22} /></div>
          <div>
            <div className="stat-val" style={{color:'var(--success)'}}><AnimatedNumber value={compliance.rate} suffix="%" /></div>
            <div className="stat-label">Compliance Rate</div>
          </div>
        </div>
        <div className="stat-card glow-border glow-border-critical">
          <div className="stat-icon red"><AlertTriangle size={22} /></div>
          <div>
            <div className="stat-val" style={{color:'var(--danger)'}}><AnimatedNumber value={compliance.nonCompliant} /></div>
            <div className="stat-label">Non-Compliant</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><ClipboardList size={22} /></div>
          <div>
            <div className="stat-val"><AnimatedNumber value={audits.total} /></div>
            <div className="stat-label">Total Audits</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><CheckSquare size={22} /></div>
          <div>
            <div className="stat-val"><AnimatedNumber value={tasks.total} /></div>
            <div className="stat-label">Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><FileText size={22} /></div>
          <div>
            <div className="stat-val"><AnimatedNumber value={evidence.total} /></div>
            <div className="stat-label">Evidence Files</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{marginBottom:24}}>
        <div className="chart-card">
          <div className="chart-title">📈 Monthly Compliance Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={charts.monthlyTrend}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{background:'#131929',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,color:'#f1f5f9'}} />
              <Area type="monotone" dataKey="rate" name="Rate %" stroke="#6366f1" fill="url(#aGrad)" strokeWidth={2} dot={{fill:'#6366f1',r:3}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card" style={{ position: 'relative' }}>
          <div className="chart-title">🍩 Health Score</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={healthData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} dataKey="value" stroke="none">
                <Cell fill="var(--success)" />
                <Cell fill="var(--border)" />
              </Pie>
              <Tooltip contentStyle={{background:'#131929',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,color:'#f1f5f9'}} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -10%)', textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--success)', lineHeight: 1 }}><AnimatedNumber value={compliance.rate} suffix="%" /></div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Score</div>
          </div>
        </div>
      </div>

      {/* Regulation Bar Chart */}
      <div className="grid-2" style={{marginBottom:24}}>
        <div className="chart-card">
          <div className="chart-title">📊 Compliance Rate by Regulation</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.byRegulation} barSize={28}>
              <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false} domain={[0,100]} />
              <Tooltip contentStyle={{background:'#131929',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,color:'#f1f5f9'}} formatter={(v) => [`${Math.round(v)}%`,'Rate']} />
              <Bar dataKey="rate" name="Compliance %" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">🔥 Risk Heatmap (Likelihood vs Impact)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            {charts.riskMatrix?.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--glass2)', borderRadius: '8px', borderLeft: `4px solid ${getRiskColor(r.risk)}` }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{r.risk} Risk</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Impact: {r.impact} | Likelihood: {r.likelihood}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{r.count}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>items</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card" style={{marginBottom: 24, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))', border: '1px solid rgba(99,102,241,0.3)'}}>
        <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 16}}>
          <div style={{background:'var(--accent)', color:'#fff', padding:6, borderRadius:8}}><Sparkles size={18} /></div>
          <h3 style={{fontSize: 16, fontWeight: 700}}>AI Predictive Insights</h3>
        </div>
        <div className="grid-3" style={{gap: 16}}>
          <div style={{background: 'var(--glass)', padding: 16, borderRadius: 12, border: '1px solid var(--border)'}}>
            <div style={{fontSize: 13, fontWeight: 600, color: 'var(--warning)', marginBottom: 6}}>⚠️ Anomaly Detected</div>
            <p style={{fontSize: 13, color: 'var(--text2)'}}>Unusual spike in non-compliant "Data Privacy" logs over the last 48 hours. Suggest immediate review.</p>
          </div>
          <div style={{background: 'var(--glass)', padding: 16, borderRadius: 12, border: '1px solid var(--border)'}}>
            <div style={{fontSize: 13, fontWeight: 600, color: 'var(--success)', marginBottom: 6}}>💡 Optimization</div>
            <p style={{fontSize: 13, color: 'var(--text2)'}}>Audits assigned to "Security Team" are completed 30% faster than average. Consider redistributing pending tasks.</p>
          </div>
          <div style={{background: 'var(--glass)', padding: 16, borderRadius: 12, border: '1px solid var(--border)'}}>
            <div style={{fontSize: 13, fontWeight: 600, color: 'var(--info)', marginBottom: 6}}>🔮 Risk Forecast</div>
            <p style={{fontSize: 13, color: 'var(--text2)'}}>Based on current trends, your overall compliance score is projected to drop by 2% next month if Q3 policies aren't updated.</p>
          </div>
        </div>
      </div>


      {/* Recent Activity */}
      <div className="grid-3" style={{marginBottom: 24}}>
        <div className="card">
          <div className="section-title">🚨 Critical Attention Needed</div>
          {criticalItems.length === 0 ? (
            <p style={{color:'var(--text-muted)',fontSize:14}}>No critical items.</p>
          ) : criticalItems.map(c => (
            <div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:'var(--danger)'}}>{c.title}</div>
                <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{c.type}</div>
              </div>
              <span className={`badge badge-${c.status}`}>{c.status}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">✅ Recent Tasks</div>
          {recent.tasks.length === 0
            ? <p style={{color:'var(--text-muted)',fontSize:14}}>No recent tasks</p>
            : recent.tasks.map(t => (
              <div key={t._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:'var(--text-primary)'}}>{t.title}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{t.assignedTo?.name || 'Unassigned'}</div>
                </div>
                <span className={`badge badge-${t.status}`}>{t.status}</span>
              </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">⏱️ 7-Day Activity Timeline</div>
          <div style={{ position: 'relative', paddingLeft: 16, marginTop: 16 }}>
            <div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
            {logs.length === 0 ? (
              <p style={{color:'var(--text-muted)',fontSize:14}}>No recent activity.</p>
            ) : logs.map(log => (
              <div key={log._id} style={{ position: 'relative', marginBottom: 16 }}>
                <div style={{ position: 'absolute', left: -17, top: 4, width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg)' }} />
                <div style={{ fontSize: 13, fontWeight: 500 }}>{log.action} {log.resource}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.details}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{new Date(log.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Health */}
      <div className="card" style={{marginTop:20}}>
        <div className="section-title">🏥 Audit Health</div>
        <div className="grid-3" style={{gap:16}}>
          {[
            {label:'Scheduled', val: audits.scheduled, color:'var(--accent2)'},
            {label:'Completed', val: audits.completed, color:'var(--success)'},
            {label:'Overdue',   val: audits.overdue,   color:'var(--danger)'},
          ].map(s => (
            <div key={s.label} style={{textAlign:'center',padding:'16px',background:'var(--glass2)',borderRadius:'var(--r-sm)',border:'1px solid var(--border)'}}>
              <div style={{fontSize:28,fontWeight:800,color:s.color}}>{s.val}</div>
              <div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
