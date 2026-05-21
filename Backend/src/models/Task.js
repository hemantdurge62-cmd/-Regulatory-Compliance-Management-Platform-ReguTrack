import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  compliance:  { type: mongoose.Schema.Types.ObjectId, ref: 'Compliance' },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:      { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
  priority:    { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  dueDate:     { type: Date },
  progress:    { type: Number, min: 0, max: 100, default: 0 },
  dependsOn:   { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  completedAt: { type: Date },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
