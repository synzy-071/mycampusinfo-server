// services/application-services.js
import StudentApplication from '../models/application/application-model.js';

export const addStudApplications = async (data) => {
  const existingApp = await StudentApplication.findOne({ studId: data.studId, collegeId: data.collegeId });
  if (existingApp) {
    throw { status: 409, message: "Application already exists for this college." };
  }
  const studentApplication = new StudentApplication(data);
  return await studentApplication.save();
};

export const getAllStudApplications = async (filter = {}) => {
  return await StudentApplication.find(filter).sort({ createdAt: -1 });
};

// Return ALL applications for a studId (previously returned a single application)
export const getStudApplicationsByStudId = async (studId) => {
  return await StudentApplication.find({ studId }).sort({ createdAt: -1 });
};

// Get a single application by applicationId (the _id of StudentApplication)
export const getStudApplicationById = async (applicationId) => {
  return await StudentApplication.findById(applicationId);
};

// Update a specific application by its applicationId
export const updateStudApplicationById = async (applicationId, data) => {
  return await StudentApplication.findByIdAndUpdate(applicationId, data, { new: true });
};

// Delete a specific application by applicationId
export const deleteStudApplicationById = async (applicationId) => {
  return await StudentApplication.findByIdAndDelete(applicationId);
};
