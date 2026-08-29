import {
  createTechnologyAdoptionService,
  getTechnologyAdoptionByCollegeIdService,
  updateTechnologyAdoptionByCollegeIdService,
  deleteTechnologyAdoptionByCollegeIdService,
} from '../services/technology-adoption-service.js';

export const addTechnologyAdoption = async (req, res) => {
  try {
    const data = await createTechnologyAdoptionService(req.body);
    res.status(201).json({ success: true, message: 'Technology adoption added', data });
  } catch (err) {
    if (err.code === 11000) {
      try {
        const data = await updateTechnologyAdoptionByCollegeIdService(req.body.collegeId, req.body);
        return res.json({ success: true, message: 'Technology adoption upserted', data });
      } catch (upsertErr) {
        return res.status(500).json({ success: false, message: upsertErr.message });
      }
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTechnologyAdoptionByCollegeId = async (req, res) => {
  try {
    const data = await getTechnologyAdoptionByCollegeIdService(req.params.collegeId);
    if (!data) return res.status(404).json({ success: false, message: 'Technology adoption not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTechnologyAdoption = async (req, res) => {
  try {
    const data = await updateTechnologyAdoptionByCollegeIdService(req.params.collegeId, req.body);
    res.json({ success: true, message: 'Technology adoption updated', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTechnologyAdoption = async (req, res) => {
  try {
    const data = await deleteTechnologyAdoptionByCollegeIdService(req.params.collegeId);
    if (!data) return res.status(404).json({ success: false, message: 'Technology adoption not found' });
    res.json({ success: true, message: 'Technology adoption deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
