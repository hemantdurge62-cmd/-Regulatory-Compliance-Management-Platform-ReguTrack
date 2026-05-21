import Task from '../models/Task.js';

export const getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    const data = await Task.find(filter)
      .populate('assignedTo', 'name email department')
      .populate('compliance', 'title regulation')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json({ success: true, data, count: data.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getOne = async (req, res) => {
  try {
    const doc = await Task.findById(req.params.id).populate('assignedTo', 'name email').populate('compliance', 'title');
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const create = async (req, res) => {
  try {
    const doc = await Task.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: doc });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

export const update = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.status === 'done' && !body.completedAt) body.completedAt = new Date();
    const doc = await Task.findByIdAndUpdate(req.params.id, body, { new: true }).populate('assignedTo', 'name email');
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

export const remove = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
