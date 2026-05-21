import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import v1Routes from './routes/v1.js';

import { runSeed } from './seed.js';

dotenv.config();

const isInMemory = await connectDB();
if (isInMemory) {
  console.log('🌱 In-memory DB detected, automatically running seed script...');
  await runSeed(true);
}

const app = express();

// ── Middleware ─────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────
app.use('/api/v1', v1Routes);

// ── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── 404 Handler ─────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// ── Global Error Handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`🚀 ReguTrack API running on http://localhost:${PORT}`)
);

// ── Port-in-use error handler ─────────────────────────────
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Run this command to free it, then restart:\n`);
    console.error(`   Windows PowerShell:  Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

// ── Graceful shutdown (releases port on Ctrl+C) ───────────
const shutdown = () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => process.exit(0));
};
process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);

