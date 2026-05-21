import Evidence from '../models/Evidence.js';
import { logActivity } from './activityLogController.js';

export const getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.compliance) filter.compliance = req.query.compliance;
    const data = await Evidence.find(filter)
      .populate('uploadedBy', 'name email')
      .populate('compliance', 'title regulation')
      .sort('-createdAt');
    res.json({ success: true, data, count: data.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const create = async (req, res) => {
  try {
    const doc = await Evidence.create({ ...req.body, uploadedBy: req.user._id });
    await logActivity(req.user._id, 'CREATE', 'Evidence', `Uploaded evidence: ${doc.title}`);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

export const remove = async (req, res) => {
  try {
    const doc = await Evidence.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    await Evidence.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE', 'Evidence', `Deleted evidence: ${doc.title}`);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const autoMapPolicy = async (req, res) => {
  try {
    // Mocking an AI analyzing a document
    const { documentName } = req.body;
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay
    
    let suggestedRegulations = [];
    let text = (documentName || "").toLowerCase();
    
    if (text.includes("privacy") || text.includes("data")) {
      suggestedRegulations.push({ rule: "GDPR Article 5", confidence: 95 });
      suggestedRegulations.push({ rule: "GDPR Article 17", confidence: 80 });
    }
    if (text.includes("security") || text.includes("iso")) {
      suggestedRegulations.push({ rule: "ISO 27001 - Annex A", confidence: 90 });
    }
    if (text.includes("finance") || text.includes("sebi")) {
      suggestedRegulations.push({ rule: "SEBI LODR", confidence: 85 });
    }
    if (suggestedRegulations.length === 0) {
      suggestedRegulations.push({ rule: "General ISO 9001", confidence: 60 });
    }

    await logActivity(req.user._id, 'OTHER', 'Evidence', `Ran auto-mapping on policy: ${documentName}`);
    
    res.json({
      success: true,
      message: 'Policy mapping completed successfully.',
      suggestions: suggestedRegulations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
