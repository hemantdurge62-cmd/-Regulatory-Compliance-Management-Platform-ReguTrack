import Settings from '../models/Settings.js';

// Helper – get or create the singleton settings document
const getDoc = async () => {
  let doc = await Settings.findOne({ singleton: 'global' });
  if (!doc) doc = await Settings.create({ singleton: 'global' });
  return doc;
};

// GET /api/v1/settings
export const getSettings = async (req, res) => {
  try {
    const doc = await getDoc();
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/settings/security
export const updateSecurity = async (req, res) => {
  try {
    const doc = await getDoc();
    Object.assign(doc.security, req.body);
    doc.markModified('security');
    await doc.save();
    res.json({ success: true, data: doc.security, message: 'Security settings saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/settings/notifications
export const updateNotifications = async (req, res) => {
  try {
    const doc = await getDoc();
    Object.assign(doc.notifications, req.body);
    doc.markModified('notifications');
    await doc.save();
    res.json({ success: true, data: doc.notifications, message: 'Notification settings saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/settings/data-retention
export const updateDataRetention = async (req, res) => {
  try {
    const doc = await getDoc();
    Object.assign(doc.dataRetention, req.body);
    doc.markModified('dataRetention');
    await doc.save();
    res.json({ success: true, data: doc.dataRetention, message: 'Data retention settings saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
