import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function WarRoom({ onClose }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000, background: '#000', color: '#fff',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      backgroundImage: 'radial-gradient(ellipse at 50% -20%, rgba(220,38,38,0.15), transparent 80%)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <ShieldAlert size={40} color="var(--danger)" style={{ animation: 'pulse 2s infinite' }} />
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', margin: 0, color: 'var(--danger)' }}>Compliance War Room</h1>
            <div style={{ fontSize: 14, color: '#aaa', letterSpacing: '4px', textTransform: 'uppercase' }}>Live Executive Overview</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 48, fontWeight: 200, fontFamily: 'monospace', letterSpacing: '2px' }}>
            {time.toLocaleTimeString()}
          </div>
          <div style={{ fontSize: 14, color: '#aaa' }}>{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 30, right: 40, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Exit (F)</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 40, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40 }}>
        
        {/* Left Col: Giant KPIs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 40, textAlign: 'center', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 18, color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 20 }}>Global Health Score</div>
            <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1, color: 'var(--warning)', textShadow: '0 0 40px rgba(245,158,11,0.5)' }}>74<span style={{fontSize:60}}>%</span></div>
            <div style={{ marginTop: 20, color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 18 }}>
              <Activity size={24} /> Trending Downward
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#fca5a5' }}>3</div>
              <div style={{ fontSize: 12, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '1px' }}>Critical Risks</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#6ee7b7' }}>18</div>
              <div style={{ fontSize: 12, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Policies</div>
            </div>
          </div>
        </div>

        {/* Middle Col: Heatmap / Matrix Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 40, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 18, color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 40 }}>Live Threat Matrix</div>
            
            {/* Mock Heatmap Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 60px)', gridTemplateRows: 'repeat(5, 60px)', gap: 8 }}>
              {Array.from({length: 25}).map((_, i) => {
                // Generate a heatmap color based on position
                const x = i % 5;
                const y = Math.floor(i / 5);
                const risk = (x * 0.4) + ((4 - y) * 0.6); // Higher risk top-right
                
                let bg = 'rgba(16,185,129,0.2)'; // Green
                let border = 'rgba(16,185,129,0.5)';
                let isPulsing = false;
                
                if (risk > 3.5) {
                  bg = 'rgba(220,38,38,0.6)'; // Red
                  border = 'rgba(220,38,38,1)';
                  isPulsing = true;
                } else if (risk > 2) {
                  bg = 'rgba(245,158,11,0.4)'; // Yellow
                  border = 'rgba(245,158,11,0.8)';
                }

                return (
                  <div key={i} style={{
                    background: bg, border: `1px solid ${border}`, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.8)',
                    animation: isPulsing ? 'pulseDanger 1.5s infinite' : 'none',
                    boxShadow: isPulsing ? '0 0 20px rgba(220,38,38,0.5)' : 'none'
                  }}>
                    {Math.floor(Math.random() * 5)}
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: 332, marginTop: 10, fontSize: 12, color: '#777' }}>
              <span>Low Impact</span>
              <span>High Impact</span>
            </div>
          </div>
        </div>

        {/* Right Col: Countdown Timers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Clock color="var(--danger)" />
              <span style={{ fontSize: 18, color: '#fff', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Critical Deadlines</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { title: 'GDPR Annual Audit', days: 12, color: 'var(--danger)' },
                { title: 'ISO 27001 Surveillance', days: 45, color: 'var(--warning)' },
                { title: 'Data Subject Access Requests', days: 3, color: 'var(--danger)' }
              ].sort((a,b)=>a.days-b.days).map((d, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${d.color}`, borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: d.color }} />
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{d.title}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: d.color }}>{d.days}</span>
                    <span style={{ fontSize: 14, color: '#aaa', paddingBottom: 4, textTransform: 'uppercase' }}>Days Remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 24, padding: 30, display: 'flex', alignItems: 'center', gap: 20 }}>
            <CheckCircle size={40} color="var(--success)" />
            <div>
              <div style={{ fontSize: 14, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px' }}>System Status</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>All Systems Nominal</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
