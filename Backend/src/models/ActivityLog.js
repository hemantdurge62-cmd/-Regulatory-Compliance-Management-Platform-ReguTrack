import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'DOWNLOAD', 'UPLOAD', 'OTHER']
  },
  resource: {
    type: String,
    required: true,
    enum: ['Compliance', 'Audit', 'Task', 'Evidence', 'User', 'Settings', 'Auth', 'Other']
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
