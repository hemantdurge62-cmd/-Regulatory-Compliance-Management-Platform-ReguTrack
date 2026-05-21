import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sliders, ChevronDown } from 'lucide-react';

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am your AI Compliance Copilot. Ask me about your GDPR risk, health score, or try the What-If Simulator!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [simScore, setSimScore] = useState(74); // Default to current score
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let botResponse = "I'm analyzing your compliance data... Everything looks steady, but you should review your overdue tasks.";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('gdpr')) {
        botResponse = "Your GDPR compliance is currently at 82%. However, there is a critical overdue task in 'Data Processing Agreements' that could result in a severe penalty if audited today.";
      } else if (lower.includes('risk')) {
        botResponse = "I've detected an Elevated Risk in your SEBI reporting module. 2 evidence documents are expiring in less than 7 days. Would you like me to notify the compliance officer?";
      } else if (lower.includes('score')) {
        botResponse = `Your current Global Health Score is ${simScore}%. You have 12 open tasks and 3 scheduled audits.`;
      } else if (lower.includes('hello') || lower.includes('hi')) {
        botResponse = "Hello! I have real-time access to your ReguTrack database. What would you like to analyze?";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: botResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99,102,241,0.5)', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            animation: 'pulseDanger 3s infinite'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: 380, height: 600, background: 'var(--modal-bg)', border: '1px solid var(--border2)',
          borderRadius: 24, boxShadow: 'var(--shadow-lg), 0 0 40px rgba(99,102,241,0.2)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))',
            borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 15px rgba(99,102,241,0.5)' }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>ReguTrack AI</h3>
                <div style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
                  Online • Analyzing Live Data
                </div>
              </div>
            </div>
            <button className="btn-ghost" onClick={() => setIsOpen(false)} style={{ padding: 4 }}><ChevronDown size={20} /></button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '12px 16px', borderRadius: 16, fontSize: 14, lineHeight: 1.5,
                  background: msg.role === 'user' ? 'linear-gradient(135deg, var(--accent), var(--purple))' : 'var(--glass)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                  borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
                  boxShadow: msg.role === 'user' ? '0 4px 15px rgba(99,102,241,0.3)' : 'none'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: 'var(--glass)', padding: '12px 16px', borderRadius: 16, borderBottomLeftRadius: 4, display: 'flex', gap: 4, border: '1px solid var(--border)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', animation: 'pulse 1s infinite' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', animation: 'pulse 1s infinite 0.2s' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', animation: 'pulse 1s infinite 0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* What-If Simulator Panel */}
          <div style={{ padding: '12px 20px', background: 'var(--glass2)', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Sliders size={14} color="var(--accent)" />
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text2)' }}>What-If Simulator</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>Drag to see impact of completing pending tasks on your Global Score:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input 
                type="range" min="30" max="100" value={simScore} 
                onChange={e => setSimScore(e.target.value)}
                style={{ flex: 1, accentColor: 'var(--accent)' }}
              />
              <div style={{ fontWeight: 800, color: simScore > 80 ? 'var(--success)' : simScore > 60 ? 'var(--warning)' : 'var(--danger)' }}>
                {simScore}%
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, background: 'var(--modal-bg)' }}>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about your compliance..."
              style={{
                flex: 1, background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 99,
                padding: '10px 16px', color: 'var(--text)', outline: 'none', fontSize: 13, transition: 'all 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: input.trim() ? 'var(--accent)' : 'var(--glass)',
                color: input.trim() ? '#fff' : 'var(--text3)',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
              }}
            >
              <Send size={16} style={{ transform: 'translateX(-1px) translateY(1px)' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
