import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  description:{ type: String, default: '' },
  compliance: { type: mongoose.Schema.Types.ObjectId, ref: 'Compliance' },
  fileUrl:    { type: String, default: '' },
  fileName:   { type: String, default: '' },
  fileSize:   { type: String, default: '' },
  fileType:   { type: String, default: '' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags:       [{ type: String }],
  expiresAt:  { type: Date }
}, { timestamps: true });

export default mongoose.model('Evidence', evidenceSchema);
