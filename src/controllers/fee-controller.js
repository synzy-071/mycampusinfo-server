import {
  upsertCourseFeeService,
  getCourseFeesByCollegeIdService,
} from "../services/fee-service.js";

export const upsertCourseFee = async (req, res) => {
  try {
    const data = await upsertCourseFeeService(req.body);
    res.json({ message: "Course fees saved", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getCourseFeesByCollegeId = async (req, res) => {
  try {
    const data = await getCourseFeesByCollegeIdService(
      req.params.collegeId
    );

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
