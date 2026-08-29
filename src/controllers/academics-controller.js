import {
  createAcademicsService,
  getAcademicsByCollegeIdService,
  updateAcademicsByCollegeIdService,
  deleteAcademicsByCollegeIdService,
} from '../services/academics-service.js';

export const addAcademics = async (req, res) => {
  try {
    const data = await createAcademicsService(req.body);
    res.status(201).json({ success: true, message: 'Academics added', data });
  } catch (err) {
    if (err.code === 11000) {
      try {
        const data = await updateAcademicsByCollegeIdService(req.body.collegeId, req.body);
        return res.json({ success: true, message: 'Academics upserted', data });
      } catch (upsertErr) {
        return res.status(500).json({ success: false, message: upsertErr.message });
      }
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAcademicsByCollegeId = async (req, res) => {
  try {
    const data = await getAcademicsByCollegeIdService(req.params.collegeId);
    if (!data) return res.status(404).json({ success: false, message: 'Academics not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAcademics = async (req, res) => {
  try {
    const data = await updateAcademicsByCollegeIdService(req.params.collegeId, req.body);
    res.json({ success: true, message: 'Academics updated', data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAcademics = async (req, res) => {
  try {
    const data = await deleteAcademicsByCollegeIdService(req.params.collegeId);
    if (!data) return res.status(404).json({ success: false, message: 'Academics not found' });
    res.json({ success: true, message: 'Academics deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
