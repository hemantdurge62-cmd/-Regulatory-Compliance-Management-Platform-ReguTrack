import ActivityLog from '../models/ActivityLog.js';

export const getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .sort('-createdAt')
      .populate('user', 'name email role')
      .limit(100);
      
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logActivity = async (userId, action, resource, details, ipAddress = '') => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      resource,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};
