import { predictCollegesService } from '../services/predictor-services.js';
import { toCollegeCardModels } from '../utils/utils.js';

export const predictColleges = async (req, res) => {
  try {
    const filters = req.body || {};

    if (!filters || Object.keys(filters).length === 0) {
      return res.status(400).json({
        success: false,
        status: 'Failed',
        message: 'Request body is required'
      });
    }

    const userLocation = (filters.latitude && filters.longitude) ? {
      latitude: parseFloat(filters.latitude),
      longitude: parseFloat(filters.longitude)
    } : null;

    const matchedColleges = await predictCollegesService(filters);
    const mappedColleges = await toCollegeCardModels(matchedColleges, userLocation);

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Result of college predictor',
      total: mappedColleges.length,
      data: mappedColleges,
    });
  } catch (error) {
    console.error('Predict Colleges Error:', error);
    res.status(500).json({
      success: false,
      status: 'Failed',
      message: error.message
    });
  }
};
