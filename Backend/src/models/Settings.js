import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Singleton pattern – only one document
  singleton: { type: String, default: 'global', unique: true },

  security: {
    jwtExpiry:          { type: String, default: '24h' },       // e.g. '1h','4h','8h','24h','7d'
    passwordMinLength:  { type: Number, default: 8 },
    requireUppercase:   { type: Boolean, default: true },
    requireNumbers:     { type: Boolean, default: true },
    requireSpecialChars:{ type: Boolean, default: false },
    twoFactorEnabled:   { type: Boolean, default: false },
    maxLoginAttempts:   { type: Number, default: 5 },
    sessionTimeout:     { type: Number, default: 30 },          // minutes
  },

  notifications: {
    emailAlertsEnabled:       { type: Boolean, default: true },
    overdueAuditAlerts:       { type: Boolean, default: true },
    nonCompliantRuleAlerts:   { type: Boolean, default: true },
    dailyDigest:              { type: Boolean, default: false },
    alertEmail:               { type: String, default: '' },
    alertFrequency:           { type: String, default: 'immediate' }, // immediate|daily|weekly
  },

  dataRetention: {
    auditLogRetentionDays:    { type: Number, default: 365 },
    evidenceRetentionDays:    { type: Number, default: 730 },
    autoDeleteEnabled:        { type: Boolean, default: false },
    archiveBeforeDelete:      { type: Boolean, default: true },
    complianceRecordRetention:{ type: Number, default: 1825 }, // 5 years
  },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
