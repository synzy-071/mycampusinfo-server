import Scholarship from "../models/school_details/fee_and_scholarship_model.js";

export const addScholarshipService = async (data) => {
  if (data.collegeId) {
    // Delete all existing scholarships for this college
    await Scholarship.deleteMany({ collegeId: data.collegeId });
    // Insert the new ones
    if (data.scholarships && data.scholarships.length > 0) {
      return await Scholarship.insertMany(data.scholarships);
    }
    return [];
  } else {
    // Fallback for single scholarship object
    return await Scholarship.create(data);
  }
};

export const getScholarshipsByCollegeService = async (collegeId) => {
  return await Scholarship.find({ collegeId });
};
