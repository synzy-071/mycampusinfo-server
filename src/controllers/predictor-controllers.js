// import { predictCollegesService } from '../services/predictor-services.js';
// import { toCollegeCardModels } from '../utils/utils.js';

// export const predictColleges = async (req, res) => {
//   try {
//     const filters = req.body;

//     if (!filters || Object.keys(filters).length === 0) {
//       return res.status(400).json({
//         status: 'Failed',
//         message: 'Request body is required'
//       });
//     }
//     const matchedColleges = await predictCollegesService(filters);
//     const mappedColleges = await toCollegeCardModels(matchedColleges);

//     res.status(200).json({
//       status: 'success',
//       message: 'Result of college predictor',
//       total: mappedColleges.length,
//       data: mappedColleges,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 'Failed',
//       message: error.message
//     });
//   }
// };
import { predictCollegesUsingAI } from "../services/predictor-services.js";

export const predictColleges = async (req, res) => {
  try {
    const filters = req.body;

    if (!filters || Object.keys(filters).length === 0) {
      return res.status(400).json({
        message: "Filters are required",
      });
    }

    const colleges = await predictCollegesUsingAI(filters);

    res.status(200).json({
      success: true,
      data: colleges,
    });

  } catch (error) {
    console.error("Predict Colleges Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Prediction failed",
      error: error.message,
    });
  }
};
