import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { Download } from 'lucide-react';
import { getDashboard } from '../api';

const PIE_COLORS = ['#22c55e','#ef4444','#3b82f6','#f59e0b'];

export default function ReportsPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]       = useState('');

  useEffect(() => {
    getDashboard().then(r=>setData(r.data)).catch(e=>setErr(e.message)).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner"/></div>;
  if (err)     return <div className="alert alert-error">⚠️ {err}</div>;
  if (!data)   return null;

  const { compliance, audits, tasks, evidence, charts } = data;

  // Add Predictive AI Forecast Data
  const currentRate = compliance.rate;
  const taskVelocity = tasks.done / (tasks.total || 1);
  const projectedRate = Math.min(100, Math.round(currentRate + (taskVelocity * 15)));
  
  const aiTrendData = [
    ...charts.monthlyTrend,
    { month: 'Next Month (AI Forecast)', rate: projectedRate, isForecast: true }
  ];

  const pieData = [
    { name: 'Compliant',     value: compliance.compliant },
    { name: 'Non-Compliant', value: compliance.nonCompliant },
    { name: 'In Progress',   value: compliance.inProgress },
    { name: 'Pending',       value: compliance.pending },
  ].filter(d=>d.value>0);

  const exportCSV = () => {
    const rows = [
      ['Metric','Value'],
      ['Total Compliance Rules', compliance.total],
      ['Compliant',              compliance.compliant],
      ['Non-Compliant',          compliance.nonCompliant],
      ['In Progress',            compliance.inProgress],
      ['Pending',                compliance.pending],
      ['Compliance Rate (%)',    compliance.rate],
      ['Total Audits',           audits.total],
      ['Completed Audits',       audits.completed],
      ['Overdue Audits',         audits.overdue],
      ['Total Tasks',            tasks.total],
      ['Tasks Done',             tasks.done],
      ['Evidence Files',         evidence.total],
    ];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='regutrack_report.csv'; a.click();
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Reports & Analytics</h2>
          <p>Comprehensive compliance insights and export</p>
        </div>
        <div style={{display:'flex', gap:10}}>
          <button className="btn btn-secondary" onClick={exportCSV} style={{background:'#10b981', color:'white', borderColor:'#10b981'}}>
            <Download size={16}/> Export CSV/Excel
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row">
        {[
          {label:'Compliance Rate',   val:`${compliance.rate}%`,  color:'var(--success)'},
          {label:'Total Rules',       val:compliance.total,       color:'var(--text-primary)'},
          {label:'Compliant',         val:compliance.compliant,   color:'var(--success)'},
          {label:'Non-Compliant',     val:compliance.nonCompliant,color:'var(--danger)'},
          {label:'Audits Completed',  val:audits.completed,       color:'var(--text-primary)'},
          {label:'Overdue Audits',    val:audits.overdue,         color:'var(--danger)'},
          {label:'Tasks Done',        val:tasks.done,             color:'var(--success)'},
          {label:'Evidence Files',    val:evidence.total,         color:'var(--text-primary)'},
        ].map(k=>(
          <div className="kpi-card" key={k.label}>
            <div className="kpi-val" style={{color:k.color}}>{k.val}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{marginBottom:20}}>
        <div className="chart-card" style={{position:'relative'}}>
          <div className="chart-title" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>📈 6-Month Trend + AI Forecast</span>
            <span style={{fontSize:10, background:'rgba(168,85,247,0.15)', color:'#a855f7', padding:'2px 8px', borderRadius:10, border:'1px solid rgba(168,85,247,0.3)'}}>✨ AI Predicted</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={aiTrendData}>
              <defs>
                <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false} domain={[0,100]}/>
              <Tooltip contentStyle={{background:'#131929',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,color:'#f1f5f9'}}/>
              
              {/* Historical Data Area */}
              <Area 
                type="monotone" 
                dataKey={(d) => d.isForecast ? null : d.rate} 
                name="Historical %" 
                stroke="#6366f1" fill="url(#tGrad)" strokeWidth={2}
              />
              
              {/* AI Forecast Data Area (Dashed) */}
              <Area 
                type="monotone" 
                dataKey={(d) => d.rate} 
                name="AI Predicted %" 
                stroke="#a855f7" strokeDasharray="5 5" fill="url(#fGrad)" strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">🍩 Status Breakdown</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:'#131929',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,color:'#f1f5f9'}}/>
              <Legend wrapperStyle={{fontSize:12,color:'#94a3b8'}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card" style={{marginBottom:20}}>
        <div className="chart-title">📊 Compliance Rate by Regulation</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={charts.byRegulation} barSize={32}>
            <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false} domain={[0,100]}/>
            <Tooltip contentStyle={{background:'#131929',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,color:'#f1f5f9'}} formatter={v=>[`${Math.round(v)}%`,'Rate']}/>
            <Bar dataKey="rate" name="Compliance %" fill="#6366f1" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <div className="chart-title">📂 Rules by Category</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={charts.byCategory} barSize={28} layout="vertical">
            <XAxis type="number" tick={{fill:'#64748b',fontSize:12}} axisLine={false} tickLine={false}/>
            <YAxis dataKey="name" type="category" tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} width={100}/>
            <Tooltip contentStyle={{background:'#131929',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,color:'#f1f5f9'}}/>
            <Bar dataKey="count" name="Rules" fill="#818cf8" radius={[0,4,4,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
