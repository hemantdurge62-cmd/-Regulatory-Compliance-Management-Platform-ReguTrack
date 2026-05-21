import Audit from '../models/Audit.js';
import { logActivity } from './activityLogController.js';
import { sendSlackNotification } from '../services/webhookService.js';

export const getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    const data = await Audit.find(filter).populate('createdBy', 'name').sort('-scheduledDate');
    res.json({ success: true, data, count: data.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getOne = async (req, res) => {
  try {
    const doc = await Audit.findById(req.params.id).populate('createdBy', 'name email');
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const create = async (req, res) => {
  try {
    const doc = await Audit.create({ ...req.body, createdBy: req.user._id });
    await logActivity(req.user._id, 'CREATE', 'Audit', `Created audit: ${doc.title}`);
    await sendSlackNotification(`🔔 *New Audit Scheduled*: ${doc.title} (${doc.type}) by ${req.user.name || 'Admin'}`);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

export const update = async (req, res) => {
  try {
    // Auto mark overdue
    const doc = await Audit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    await logActivity(req.user._id, 'UPDATE', 'Audit', `Updated audit: ${doc.title} - Status: ${doc.status}`);
    if (req.body.status) {
        await sendSlackNotification(`🔄 *Audit Status Changed*: ${doc.title} is now *${doc.status}*`);
    }
    res.json({ success: true, data: doc });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

export const remove = async (req, res) => {
  try {
    const doc = await Audit.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    await Audit.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE', 'Audit', `Deleted audit: ${doc.title}`);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
