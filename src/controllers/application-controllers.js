// src/controllers/application-controllers.js
import {
  addStudApplications as addStudApplicationsService,
  getAllStudApplications as getAllStudApplicationsService,
  getStudApplicationsByStudId as getStudApplicationsByStudIdService,
  getStudApplicationById as getStudApplicationByIdService,
  updateStudApplicationById as updateStudApplicationByIdService,
  deleteStudApplicationById as deleteStudApplicationByIdService,
} from '../services/application-services.js';

export const addStudApplication = async (req, res) => {
  try {
    const applicationData = await addStudApplicationsService(req.body);
    res.status(201).json({
      status: "success",
      message: "Application added successfully",
      data: applicationData
    });
  } catch (error) {
    console.error("addStudApplication error:", error);
    res.status(error.status || 500).json({
      status: 'Failed',
      message: error.message || 'Internal server error'
    });
  }
};

export const getAllStudApplication = async (req, res) => {
  try {
    const filter = {};
    if (req.query.collegeId) filter.collegeId = req.query.collegeId;
    if (req.query.schoolId) filter.schoolId = req.query.schoolId;

    const applications = await getAllStudApplicationsService(filter);
    res.status(200).json({
      status: "success",
      message: "Fetched all applications successfully",
      data: applications
    });
  } catch (error) {
    console.error("getAllStudApplication error:", error);
    res.status(error.status || 500).json({
      status: 'Failed',
      message: error.message || 'Internal server error'
    });
  }
};

// GET /applications/stud/:studId  -> returns all applications for that studId
export const getStudApplicationsByStudId = async (req, res) => {
  try {
    const { studId } = req.params;
    const applications = await getStudApplicationsByStudIdService(studId);
    res.status(200).json({
      status: "success",
      message: "Fetched applications for student successfully",
      data: applications
    });
  } catch (error) {
    console.error("getStudApplicationsByStudId error:", error);
    res.status(error.status || 500).json({
      status: 'Failed',
      message: error.message || 'Internal server error'
    });
  }
};

// GET /applications/:applicationId  -> single application detail
export const getStudApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await getStudApplicationByIdService(applicationId);
    if (!application) {
      return res.status(404).json({ status: 'Failed', message: 'Application not found' });
    }
    res.status(200).json({ status: "success", message: "Fetched application", data: application });
  } catch (error) {
    console.error("getStudApplicationById error:", error);
    res.status(error.status || 500).json({ status: 'Failed', message: error.message || 'Internal server error' });
  }
};

// PUT /applications/:applicationId
export const updateStudApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const updatedApplication = await updateStudApplicationByIdService(applicationId, req.body);
    if (!updatedApplication) {
      return res.status(404).json({ status: 'Failed', message: 'Application not found' });
    }
    res.status(200).json({ status: "success", message: "Application updated successfully", data: updatedApplication });
  } catch (error) {
    console.error("updateStudApplication error:", error);
    res.status(error.status || 500).json({ status: 'Failed', message: error.message || 'Internal server error' });
  }
};

// DELETE /applications/:applicationId
export const deleteStudApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const deletedApplication = await deleteStudApplicationByIdService(applicationId);
    if (!deletedApplication) {
      return res.status(404).json({ status: 'Failed', message: 'Application not found' });
    }
    res.status(200).json({ status: "success", message: "Application deleted successfully", data: deletedApplication });
  } catch (error) {
    console.error("deleteStudApplication error:", error);
    res.status(error.status || 500).json({ status: 'Failed', message: error.message || 'Internal server error' });
  }
};
