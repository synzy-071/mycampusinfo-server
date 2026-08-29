import Academics from '../models/school_details/academics_model.js';

export const createAcademicsService = async (data) => {
  return await Academics.create(data);
};

export const getAcademicsByCollegeIdService = async (collegeId) => {
  return await Academics.findOne({ collegeId });
};

export const updateAcademicsByCollegeIdService = async (collegeId, data) => {
  return await Academics.findOneAndUpdate({ collegeId }, data, { new: true, upsert: true });
};

export const deleteAcademicsByCollegeIdService = async (collegeId) => {
  return await Academics.findOneAndDelete({ collegeId });
};
