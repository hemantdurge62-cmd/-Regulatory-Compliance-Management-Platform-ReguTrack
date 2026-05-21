const BASE = import.meta.env.VITE_API_URL || '/api/v1';

const getToken = () => localStorage.getItem('rt_token');

const hdr = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra
});

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, { method, headers: hdr(), body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Auth
export const login    = (body) => req('POST', '/auth/login', body);
export const register = (body) => req('POST', '/auth/register', body);
export const getMe    = ()     => req('GET',  '/auth/me');

// Dashboard
export const getDashboard = () => req('GET', '/dashboard');

// Compliance
export const getCompliance    = (q='')   => req('GET', `/compliance${q}`);
export const getCompStats     = ()        => req('GET', '/compliance/stats');
export const createCompliance = (body)   => req('POST', '/compliance', body);
export const updateCompliance = (id, b)  => req('PUT', `/compliance/${id}`, b);
export const deleteCompliance = (id)     => req('DELETE', `/compliance/${id}`);

// Audits
export const getAudits    = (q='')  => req('GET', `/audits${q}`);
export const createAudit  = (body)  => req('POST', '/audits', body);
export const updateAudit  = (id, b) => req('PUT', `/audits/${id}`, b);
export const deleteAudit  = (id)    => req('DELETE', `/audits/${id}`);

// Tasks
export const getTasks    = (q='')  => req('GET', `/tasks${q}`);
export const createTask  = (body)  => req('POST', '/tasks', body);
export const updateTask  = (id, b) => req('PUT', `/tasks/${id}`, b);
export const deleteTask  = (id)    => req('DELETE', `/tasks/${id}`);

// Evidence
export const getEvidence    = (q='')  => req('GET', `/evidence${q}`);
export const createEvidence = (body)  => req('POST', '/evidence', body);
export const deleteEvidence = (id)    => req('DELETE', `/evidence/${id}`);
export const autoMapPolicy  = (body)  => req('POST', '/evidence/auto-map', body);

// Logs
export const getLogs = () => req('GET', '/logs');

// Users
export const getUsers    = ()       => req('GET', '/users');
export const updateUser  = (id, b)  => req('PUT', `/users/${id}`, b);
export const deleteUser  = (id)     => req('DELETE', `/users/${id}`);

// Settings
export const getSettings           = ()     => req('GET',  '/settings');
export const updateSecuritySettings= (b)    => req('PUT',  '/settings/security', b);
export const updateNotifSettings   = (b)    => req('PUT',  '/settings/notifications', b);
export const updateRetentionSettings=(b)    => req('PUT',  '/settings/data-retention', b);

// Chatbot
export const sendChatMessage = (body) => req('POST', '/chatbot', body);
