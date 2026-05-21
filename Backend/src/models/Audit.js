import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  type:          { type: String, enum: ['internal', 'external'], required: true },
  regulation:    { type: String, required: true },
  status:        { type: String, enum: ['scheduled', 'in-progress', 'completed', 'overdue'], default: 'scheduled' },
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date },
  auditor:       { type: String, required: true },
  department:    { type: String, default: 'All' },
  findings:      { type: String, default: '' },
  score:         { type: Number, min: 0, max: 100, default: null },
  notes:         { type: String, default: '' },
  checklist:     [{ task: String, done: Boolean }],
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Audit', auditSchema);
