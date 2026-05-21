import Compliance from '../models/Compliance.js';
import Audit from '../models/Audit.js';
import Task from '../models/Task.js';
import Evidence from '../models/Evidence.js';
import User from '../models/User.js';

export const getDashboard = async (req, res) => {
  try {
    // Compliance stats
    const totalCompliance = await Compliance.countDocuments();
    const compliant      = await Compliance.countDocuments({ status: 'compliant' });
    const nonCompliant   = await Compliance.countDocuments({ status: 'non-compliant' });
    const inProgress     = await Compliance.countDocuments({ status: 'in-progress' });
    const pending        = await Compliance.countDocuments({ status: 'pending' });
    const complianceRate = totalCompliance ? Math.round((compliant / totalCompliance) * 100) : 0;

    // Audit stats
    const totalAudits     = await Audit.countDocuments();
    const scheduledAudits = await Audit.countDocuments({ status: 'scheduled' });
    const completedAudits = await Audit.countDocuments({ status: 'completed' });
    const overdueAudits   = await Audit.countDocuments({ status: 'overdue' });

    // Task stats
    const totalTasks   = await Task.countDocuments();
    const doneTasks    = await Task.countDocuments({ status: 'done' });
    const pendingTasks = await Task.countDocuments({ status: 'todo' });
    const inProgTasks  = await Task.countDocuments({ status: 'in-progress' });

    // Evidence count
    const totalEvidence = await Evidence.countDocuments();
    const totalUsers    = await User.countDocuments({ isActive: true });

    // By regulation chart
    const byRegulation = await Compliance.aggregate([
      { $group: { _id: '$regulation', total: { $sum: 1 }, compliant: { $sum: { $cond: [{ $eq: ['$status', 'compliant'] }, 1, 0] } } } },
      { $project: { name: '$_id', total: 1, compliant: 1, rate: { $cond: [{ $eq: ['$total', 0] }, 0, { $multiply: [{ $divide: ['$compliant', '$total'] }, 100] }] } } }
    ]);

    // By category
    const byCategory = await Compliance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, compliant: { $sum: { $cond: [{ $eq: ['$status', 'compliant'] }, 1, 0] } } } },
      { $project: { name: '$_id', count: 1, compliant: 1 } }
    ]);

    // Recent audits
    const recentAudits = await Audit.find().sort('-createdAt').limit(5).populate('createdBy', 'name');

    // Recent tasks
    const recentTasks = await Task.find().sort('-createdAt').limit(5).populate('assignedTo', 'name');

    // Monthly trend (last 6 months)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const total = await Compliance.countDocuments({ createdAt: { $gte: start, $lte: end } });
      const comp  = await Compliance.countDocuments({ status: 'compliant', createdAt: { $gte: start, $lte: end } });
      months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        total,
        compliant: comp,
        rate: total ? Math.round((comp / total) * 100) : 0
      });
    }

    res.json({
      success: true,
      data: {
        compliance: { total: totalCompliance, compliant, nonCompliant, inProgress, pending, rate: complianceRate },
        audits:     { total: totalAudits, scheduled: scheduledAudits, completed: completedAudits, overdue: overdueAudits },
        tasks:      { total: totalTasks, done: doneTasks, pending: pendingTasks, inProgress: inProgTasks },
        evidence:   { total: totalEvidence },
        users:      { total: totalUsers },
        charts:     { byRegulation, byCategory, monthlyTrend: months, riskMatrix: [
          { risk: 'High', count: 12, impact: 'High', likelihood: 'High' },
          { risk: 'Medium', count: 8, impact: 'Medium', likelihood: 'Medium' },
          { risk: 'Low', count: 25, impact: 'Low', likelihood: 'Low' },
          { risk: 'Critical', count: 3, impact: 'High', likelihood: 'Medium' }
        ]},
        recent:     { audits: recentAudits, tasks: recentTasks }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
