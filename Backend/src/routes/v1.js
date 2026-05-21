import express from 'express';
import { protect, adminOnly, officerOrAdmin } from '../middleware/auth.js';
import { register, login, getMe, getUsers, updateUser, deleteUser } from '../controllers/authController.js';
import { getAll as getCompliance, getOne as getOneC, create as createC, update as updateC, remove as removeC, getStats as getCompStats } from '../controllers/complianceController.js';
import { getAll as getAudits, getOne as getOneA, create as createA, update as updateA, remove as removeA } from '../controllers/auditController.js';
import { getAll as getTasks, getOne as getOneT, create as createT, update as updateT, remove as removeT } from '../controllers/taskController.js';
import { getAll as getEvidence, create as createE, remove as removeE, autoMapPolicy } from '../controllers/evidenceController.js';
import { getDashboard } from '../controllers/dashboardController.js';
import { getSettings, updateSecurity, updateNotifications, updateDataRetention } from '../controllers/settingsController.js';
import { chat } from '../controllers/chatbotController.js';
import { getLogs } from '../controllers/activityLogController.js';
const router = express.Router();

// ── Auth ────────────────────────────────────────────────
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);

// ── Dashboard ───────────────────────────────────────────
router.get('/dashboard', protect, getDashboard);

// ── Compliance ──────────────────────────────────────────
router.get('/compliance/stats', protect, getCompStats);
router.get('/compliance', protect, getCompliance);
router.get('/compliance/:id', protect, getOneC);
router.post('/compliance', protect, officerOrAdmin, createC);
router.put('/compliance/:id', protect, officerOrAdmin, updateC);
router.delete('/compliance/:id', protect, adminOnly, removeC);

// ── Audits ──────────────────────────────────────────────
router.get('/audits', protect, getAudits);
router.get('/audits/:id', protect, getOneA);
router.post('/audits', protect, officerOrAdmin, createA);
router.put('/audits/:id', protect, officerOrAdmin, updateA);
router.delete('/audits/:id', protect, adminOnly, removeA);

// ── Tasks ───────────────────────────────────────────────
router.get('/tasks', protect, getTasks);
router.get('/tasks/:id', protect, getOneT);
router.post('/tasks', protect, officerOrAdmin, createT);
router.put('/tasks/:id', protect, updateT);
router.delete('/tasks/:id', protect, adminOnly, removeT);

// ── Evidence ────────────────────────────────────────────
router.get('/evidence', protect, getEvidence);
router.post('/evidence', protect, officerOrAdmin, createE);
router.delete('/evidence/:id', protect, adminOnly, removeE);
router.post('/evidence/auto-map', protect, officerOrAdmin, autoMapPolicy);

// ── Users ───────────────────────────────────────────────
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

// ── Settings ─────────────────────────────────────────────
router.get('/settings', protect, getSettings);
router.put('/settings/security', protect, adminOnly, updateSecurity);
router.put('/settings/notifications', protect, adminOnly, updateNotifications);
router.put('/settings/data-retention', protect, adminOnly, updateDataRetention);

// ── Chatbot ──────────────────────────────────────────────
router.post('/chatbot', protect, chat);

// ── Activity Logs ────────────────────────────────────────
router.get('/logs', protect, adminOnly, getLogs);

export default router;
