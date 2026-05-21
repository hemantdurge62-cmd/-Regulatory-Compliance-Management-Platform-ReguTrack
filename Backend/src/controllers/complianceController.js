import Compliance from '../models/Compliance.js';

export const getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.regulation) filter.regulation = req.query.regulation;
    if (req.query.priority) filter.priority = req.query.priority;
    const data = await Compliance.find(filter).populate('owner', 'name email').sort('-createdAt');
    res.json({ success: true, data, count: data.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getOne = async (req, res) => {
  try {
    const doc = await Compliance.findById(req.params.id).populate('owner', 'name email');
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const create = async (req, res) => {
  try {
    const doc = await Compliance.create(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

export const update = async (req, res) => {
  try {
    const doc = await Compliance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('owner', 'name email');
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

export const remove = async (req, res) => {
  try {
    await Compliance.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getStats = async (req, res) => {
  try {
    const total = await Compliance.countDocuments();
    const compliant = await Compliance.countDocuments({ status: 'compliant' });
    const nonCompliant = await Compliance.countDocuments({ status: 'non-compliant' });
    const inProgress = await Compliance.countDocuments({ status: 'in-progress' });
    const pending = await Compliance.countDocuments({ status: 'pending' });
    const byRegulation = await Compliance.aggregate([
      { $group: { _id: '$regulation', count: { $sum: 1 }, compliant: { $sum: { $cond: [{ $eq: ['$status', 'compliant'] }, 1, 0] } } } }
    ]);
    const byCategory = await Compliance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: { total, compliant, nonCompliant, inProgress, pending, byRegulation, byCategory } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
