import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CompliancePage from './components/CompliancePage';
import AuditsPage from './components/AuditsPage';
import TasksPage from './components/TasksPage';
import EvidencePage from './components/EvidencePage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import ActivityLogsPage from './components/ActivityLogsPage';
import Chatbot from './components/Chatbot';
import CommandPalette from './components/CommandPalette';
import AICopilot from './components/AICopilot';
import WarRoom from './components/WarRoom';

const PAGE_TITLES = {
  dashboard:  { title: 'Dashboard',         sub: 'Real-time compliance overview' },
  compliance: { title: 'Compliance Rules',   sub: 'Manage regulatory obligations' },
  audits:     { title: 'Audits',             sub: 'Schedule and track audits' },
  tasks:      { title: 'Tasks',              sub: 'Assign and manage compliance tasks' },
  evidence:   { title: 'Evidence Library',   sub: 'Upload and manage compliance documentation' },
  reports:    { title: 'Reports & Analytics',sub: 'Generate insights and export reports' },
  logs:       { title: 'Activity Logs',      sub: 'Immutable audit trail of system events' },
  settings:   { title: 'Settings',           sub: 'Users, system and account settings' }
};

export default function App() {
  const [user, setUser]         = useState(() => { try { return JSON.parse(localStorage.getItem('rt_user')); } catch { return null; } });
  const [page, setPage]         = useState('dashboard');
  const [isLight, setIsLight]   = useState(false);
  const [showWarRoom, setShowWarRoom] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key.toLowerCase() === 'f') {
        setShowWarRoom(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('rt_theme', 'dark');
      setIsLight(false);
    } else {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('rt_theme', 'light');
      setIsLight(true);
    }
  };

  const handleLogin = (u, token) => {
    localStorage.setItem('rt_token', token);
    localStorage.setItem('rt_user', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('rt_token');
    localStorage.removeItem('rt_user');
    setUser(null);
  };

  useEffect(() => {
    // Initialize Theme and Compact View
    if (localStorage.getItem('rt_theme') === 'light') {
      document.documentElement.classList.add('light-theme');
      setIsLight(true);
    }
    if (localStorage.getItem('rt_compact') === 'true') {
      document.documentElement.classList.add('compact-view');
    }
    const savedAccent = localStorage.getItem('rt_accent');
    if (savedAccent) {
      document.documentElement.style.setProperty('--accent', savedAccent);
      // Derive a slightly darker version for accent3, or just reuse it
      document.documentElement.style.setProperty('--accent3', savedAccent);
    }
  }, []);

  if (!user) return <Login onLogin={handleLogin} />;

  const { title, sub } = PAGE_TITLES[page] || PAGE_TITLES.dashboard;

  const renderPage = () => {
    switch (page) {
      case 'compliance': return <CompliancePage user={user} />;
      case 'audits':     return <AuditsPage user={user} />;
      case 'tasks':      return <TasksPage user={user} />;
      case 'evidence':   return <EvidencePage user={user} />;
      case 'reports':    return <ReportsPage user={user} />;
      case 'logs':       return <ActivityLogsPage user={user} />;
      case 'settings':   return <SettingsPage user={user} setUser={setUser} />;
      default:           return <Dashboard user={user} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1>{title}</h1>
            <p>{sub}</p>
          </div>
          <div className="topbar-right">
            <button className="btn-ghost" onClick={toggleTheme} title="Toggle Theme">
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="topbar-badge">
              <span className="dot" />
              System Online
            </div>
          </div>
        </div>
        <div className="page-content">
          {renderPage()}
        </div>
      </div>
      {showWarRoom && <WarRoom onClose={() => setShowWarRoom(false)} />}
      <AICopilot />
      <Chatbot />
      <CommandPalette setPage={setPage} />
    </div>
  );
}
