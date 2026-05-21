import mongoose from 'mongoose';

const complianceSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  regulation:  { type: String, enum: ['GDPR', 'ISO 27001', 'SEBI', 'HIPAA', 'SOX', 'PCI-DSS'], required: true },
  category:    { type: String, enum: ['Data Privacy', 'Security', 'Financial', 'Operational', 'HR'], required: true },
  description: { type: String, required: true },
  control:     { type: String, required: true },
  status:      { type: String, enum: ['compliant', 'non-compliant', 'in-progress', 'pending'], default: 'pending' },
  priority:    { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department:  { type: String },
  dueDate:     { type: Date },
  evidence:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }]
}, { timestamps: true });

export default mongoose.model('Compliance', complianceSchema);
