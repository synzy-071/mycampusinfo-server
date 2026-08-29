import TechnologyAdoption from '../models/school_details/technology_adoption_model.js';

export const createTechnologyAdoptionService = async (data) => {
  return await TechnologyAdoption.create(data);
};

export const getTechnologyAdoptionByCollegeIdService = async (collegeId) => {
  return await TechnologyAdoption.findOne({ collegeId });
};

export const updateTechnologyAdoptionByCollegeIdService = async (collegeId, data) => {
  return await TechnologyAdoption.findOneAndUpdate({ collegeId }, data, { new: true, upsert: true });
};

export const deleteTechnologyAdoptionByCollegeIdService = async (collegeId) => {
  return await TechnologyAdoption.findOneAndDelete({ collegeId });
};
