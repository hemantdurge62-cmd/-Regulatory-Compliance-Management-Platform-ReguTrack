/**
 * ReguTrack – Full Seed Script
 * Run: npm run seed
 * Populates: Admin user, Compliance officer, Compliance rules, Audits, Tasks, Evidence
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Compliance from './models/Compliance.js';
import Audit from './models/Audit.js';
import Task from './models/Task.js';
import Evidence from './models/Evidence.js';
import ActivityLog from './models/ActivityLog.js';

export const runSeed = async (isInMemory = false) => {
  try {
    if (!isInMemory) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB for seeding');
    }

    // Clear existing data
    await Promise.all([User.deleteMany(), Compliance.deleteMany(), Audit.deleteMany(), Task.deleteMany(), Evidence.deleteMany(), ActivityLog.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    // ── Users ──────────────────────────────────────────
    const admin = await User.create({ name: 'Admin User', email: 'admin@regutrack.com', password: 'Admin@123', role: 'admin', department: 'Management' });
    const officer = await User.create({ name: 'Sarah Compliance', email: 'officer@regutrack.com', password: 'Officer@123', role: 'officer', department: 'Compliance' });
    const viewer = await User.create({ name: 'John Viewer', email: 'viewer@regutrack.com', password: 'Viewer@123', role: 'viewer', department: 'Legal' });
    console.log('👤 Users created');

    // ── Compliance Rules ───────────────────────────────
    const rules = await Compliance.insertMany([
      { title: 'GDPR Data Minimisation', regulation: 'GDPR', category: 'Data Privacy', description: 'Only collect personal data that is necessary for the specified purpose.', control: 'Data Collection Policy v2.1', status: 'compliant', priority: 'high', owner: officer._id, dueDate: new Date('2026-12-31') },
      { title: 'GDPR Right to Erasure', regulation: 'GDPR', category: 'Data Privacy', description: 'Provide mechanism for data subjects to request deletion of their data.', control: 'Data Deletion Workflow', status: 'in-progress', priority: 'critical', owner: officer._id, dueDate: new Date('2026-08-15') },
      { title: 'GDPR Privacy by Design', regulation: 'GDPR', category: 'Data Privacy', description: 'Embed data protection measures into product design from the outset.', control: 'Software Development Policy', status: 'compliant', priority: 'high', owner: admin._id, dueDate: new Date('2026-10-01') },
      { title: 'ISO 27001 Access Control', regulation: 'ISO 27001', category: 'Security', description: 'Implement access control to restrict system access to authorised users.', control: 'IAM Policy v3.0', status: 'compliant', priority: 'critical', owner: officer._id, dueDate: new Date('2026-07-01') },
      { title: 'ISO 27001 Incident Response', regulation: 'ISO 27001', category: 'Security', description: 'Establish procedures for detecting, reporting and responding to security incidents.', control: 'Incident Response Plan', status: 'in-progress', priority: 'critical', owner: admin._id, dueDate: new Date('2026-06-15') },
      { title: 'ISO 27001 Business Continuity', regulation: 'ISO 27001', category: 'Operational', description: 'Maintain business continuity plans tested at least annually.', control: 'BCP Document Rev 4', status: 'pending', priority: 'high', owner: officer._id, dueDate: new Date('2026-09-30') },
      { title: 'SEBI Insider Trading Policy', regulation: 'SEBI', category: 'Financial', description: 'Enforce policies prohibiting insider trading and market manipulation.', control: 'Trading Policy 2025', status: 'compliant', priority: 'critical', owner: admin._id, dueDate: new Date('2026-12-31') },
      { title: 'SEBI Disclosure Requirements', regulation: 'SEBI', category: 'Financial', description: 'Ensure timely and accurate disclosure of material information.', control: 'Disclosure Framework v1.5', status: 'compliant', priority: 'high', owner: officer._id, dueDate: new Date('2026-11-30') },
      { title: 'HIPAA PHI Safeguards', regulation: 'HIPAA', category: 'Data Privacy', description: 'Implement physical, technical and administrative safeguards for PHI.', control: 'PHI Protection Standards', status: 'non-compliant', priority: 'critical', owner: officer._id, dueDate: new Date('2026-05-31') },
      { title: 'SOX Financial Controls', regulation: 'SOX', category: 'Financial', description: 'Maintain adequate internal controls over financial reporting.', control: 'Financial Control Matrix', status: 'compliant', priority: 'high', owner: admin._id, dueDate: new Date('2026-12-15') },
      { title: 'PCI-DSS Card Data Security', regulation: 'PCI-DSS', category: 'Security', description: 'Protect cardholder data with encryption and access controls.', control: 'Payment Security Policy', status: 'in-progress', priority: 'critical', owner: officer._id, dueDate: new Date('2026-07-31') },
      { title: 'GDPR Consent Management', regulation: 'GDPR', category: 'Data Privacy', description: 'Obtain and manage valid consent for personal data processing.', control: 'Consent Management Platform', status: 'pending', priority: 'medium', owner: viewer._id, dueDate: new Date('2026-10-31') },
    ]);
    console.log('📋 Compliance rules created');

    // ── Audits ─────────────────────────────────────────
    await Audit.insertMany([
      { title: 'Q1 GDPR Internal Audit', type: 'internal', regulation: 'GDPR', status: 'completed', scheduledDate: new Date('2026-03-15'), completedDate: new Date('2026-03-18'), auditor: 'Sarah Compliance', department: 'All', findings: 'Minor gaps found in consent management. Remediation plan in place.', score: 84, createdBy: admin._id },
      { title: 'ISO 27001 External Certification Audit', type: 'external', regulation: 'ISO 27001', status: 'completed', scheduledDate: new Date('2026-02-10'), completedDate: new Date('2026-02-12'), auditor: 'BDO Audit Firm', department: 'IT & Security', findings: 'Controls effective. Certificate renewed.', score: 91, createdBy: admin._id },
      { title: 'SEBI Annual Compliance Review', type: 'internal', regulation: 'SEBI', status: 'in-progress', scheduledDate: new Date('2026-05-20'), auditor: 'Legal Team', department: 'Finance', findings: '', score: null, createdBy: officer._id },
      { title: 'HIPAA PHI Risk Assessment', type: 'external', regulation: 'HIPAA', status: 'scheduled', scheduledDate: new Date('2026-06-10'), auditor: 'Healthcare Compliance LLC', department: 'Operations', findings: '', score: null, createdBy: admin._id },
      { title: 'PCI-DSS Quarterly Scan', type: 'internal', regulation: 'PCI-DSS', status: 'overdue', scheduledDate: new Date('2026-04-01'), auditor: 'IT Security Team', department: 'IT', findings: 'Overdue — rescheduled to June.', score: null, createdBy: admin._id },
      { title: 'SOX Q2 Controls Testing', type: 'internal', regulation: 'SOX', status: 'scheduled', scheduledDate: new Date('2026-06-30'), auditor: 'Finance Team', department: 'Finance', findings: '', score: null, createdBy: officer._id },
    ]);
    console.log('🔍 Audits created');

    // ── Tasks ──────────────────────────────────────────
    await Task.insertMany([
      { title: 'Update consent management platform', description: 'Upgrade CMP to meet GDPR Article 7 requirements.', compliance: rules[0]._id, assignedTo: officer._id, status: 'in-progress', priority: 'high', dueDate: new Date('2026-06-30'), createdBy: admin._id },
      { title: 'Implement data deletion workflow', description: 'Build automated data erasure pipeline for GDPR Right to Erasure.', compliance: rules[1]._id, assignedTo: officer._id, status: 'todo', priority: 'critical', dueDate: new Date('2026-07-15'), createdBy: admin._id },
      { title: 'Review IAM policies', description: 'Audit all system access rights and revoke unused accounts.', compliance: rules[3]._id, assignedTo: admin._id, status: 'done', priority: 'critical', dueDate: new Date('2026-05-01'), completedAt: new Date('2026-04-28'), createdBy: admin._id },
      { title: 'Document incident response procedures', description: 'Update IRP with new escalation contacts and playbooks.', compliance: rules[4]._id, assignedTo: officer._id, status: 'in-progress', priority: 'high', dueDate: new Date('2026-06-10'), createdBy: admin._id },
      { title: 'PHI encryption audit', description: 'Ensure all PHI data at rest is AES-256 encrypted.', compliance: rules[8]._id, assignedTo: viewer._id, status: 'todo', priority: 'critical', dueDate: new Date('2026-05-25'), createdBy: admin._id },
      { title: 'Prepare SEBI disclosure report', description: 'Compile Q1 material disclosures for SEBI submission.', compliance: rules[7]._id, assignedTo: admin._id, status: 'review', priority: 'high', dueDate: new Date('2026-05-31'), createdBy: officer._id },
    ]);
    console.log('✅ Tasks created');

    // ── Evidence ───────────────────────────────────────
    await Evidence.insertMany([
      { title: 'GDPR DPA Agreement 2025', description: 'Signed Data Processing Agreement with all key vendors.', compliance: rules[0]._id, fileName: 'DPA_Agreement_2025.pdf', fileType: 'application/pdf', fileSize: '2.4 MB', uploadedBy: admin._id, tags: ['GDPR', 'legal', 'vendor'], expiresAt: new Date('2027-01-01') },
      { title: 'IAM Access Review Report', description: 'Quarterly access review export from identity management system.', compliance: rules[3]._id, fileName: 'IAM_Access_Review_Q1.xlsx', fileType: 'application/xlsx', fileSize: '1.1 MB', uploadedBy: officer._id, tags: ['ISO', 'access', 'security'] },
      { title: 'ISO 27001 Certificate', description: 'Current valid ISO 27001:2022 certification document.', compliance: rules[3]._id, fileName: 'ISO27001_Certificate.pdf', fileType: 'application/pdf', fileSize: '456 KB', uploadedBy: admin._id, tags: ['ISO', 'certificate'], expiresAt: new Date('2028-02-12') },
      { title: 'SEBI Trading Policy Acknowledgements', description: 'Signed acknowledgements from all employees on trading policy.', compliance: rules[6]._id, fileName: 'Trading_Policy_Acks.pdf', fileType: 'application/pdf', fileSize: '3.2 MB', uploadedBy: officer._id, tags: ['SEBI', 'policy'] },
      { title: 'SOX Controls Test Results', description: 'Internal audit results for financial controls Q4 2025.', compliance: rules[9]._id, fileName: 'SOX_Controls_Q4_2025.pdf', fileType: 'application/pdf', fileSize: '5.7 MB', uploadedBy: admin._id, tags: ['SOX', 'financial', 'audit'] },
    ]);
    console.log('📁 Evidence created');

    // ── Activity Logs ──────────────────────────────────
    await ActivityLog.insertMany([
      { user: admin._id, action: 'LOGIN', resource: 'Auth', details: 'Admin User logged into the system', ipAddress: '192.168.1.1' },
      { user: officer._id, action: 'CREATE', resource: 'Compliance', details: 'Created GDPR Data Minimisation rule', ipAddress: '192.168.1.5' },
      { user: admin._id, action: 'UPDATE', resource: 'Task', details: 'Updated task Review IAM policies status to done', ipAddress: '192.168.1.1' },
      { user: viewer._id, action: 'DOWNLOAD', resource: 'Evidence', details: 'Downloaded ISO 27001 Certificate', ipAddress: '192.168.1.10' },
      { user: officer._id, action: 'UPLOAD', resource: 'Evidence', details: 'Uploaded IAM Access Review Report', ipAddress: '192.168.1.5' }
    ]);
    console.log('📝 Activity logs created');

    console.log('\n🎉 Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    if (!isInMemory) process.exit(1);
  }
};

// If executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed().then(() => process.exit(0));
}
