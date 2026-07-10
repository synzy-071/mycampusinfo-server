// controllers/forms-controllers.js
import {
  getFormsByStudentService,
  getFormsBySchoolService,
  trackFormService,
  getFormDetailsService,
  submitFormService,
  submitBulkFormsService,
  updateFormStatusService,
  getFormsByApplicationService ,
  deleteFormService,
  getIsFormApplied
} from "../services/forms-services.js";

export const getFormsByStudent = async (req, res) => {
  try {
    const { studId } = req.params;
    const { status } = req.query;

    const data = await getFormsByStudentService(studId, status);
    res.status(200).json({ status: "success", message: "Forms fetched successfully", data });
  } catch (err) {
    res.status(err.status || 500).json({ status: "failed", message: err.message });
  }
};

export const getFormsByTimeline = async (req, res) => {
  try {
    const { timelineId } = req.params;
    const { status } = req.query;

    const data = await getFormsByTimelineService(timelineId, status);
    res.status(200).json({ status: "success", message: "Forms fetched successfully", data });
  } catch (err) {
    res.status(err.status || 500).json({ status: "failed", message: err.message });
  }
};

export const getFormsBySchool = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { status } = req.query;

    const data = await getFormsBySchoolService(collegeId, status);
    res.status(200).json({ status: "success", message: "Forms fetched successfully", data });
  } catch (err) {
    res.status(err.status || 500).json({ status: "failed", message: err.message });
  }
};

export const trackForm = async (req, res) => {
  try {
    const { formId } = req.params;

    const data = await trackFormService(formId);
    res.status(200).json({ status: "success", message: "Form tracking info fetched", data });
  } catch (err) {
    res.status(err.status || 500).json({ status: "failed", message: err.message });
  }
};

export const getFormDetails = async (req, res) => {
  try {
    const { formId } = req.params;

    const data = await getFormDetailsService(formId);
    res.status(200).json({ status: "success", message: "Form details fetched", data });
  } catch (err) {
    res.status(err.status || 500).json({ status: "failed", message: err.message });
  }
};

/**
 * Submit single form.
 * Accepts optional applicationId in body or query to link form to a StudentApplication.
 * POST /:collegeId/:studId/:timelineId/:formId
 */
export const submitForm = async (req, res) => {
  try {
    const { formId, collegeId, studId, timelineId } = req.params;
    const applicationId = req.body.applicationId || req.query.applicationId || null;
    let amount = req.body.amount || null;

    if(amount === undefined || amount === null) {
      amount = 0;
      // return res.status(400).json({ status: "failed", message: "Amount is required to submit the form." });
    }

    const data = await submitFormService(formId, collegeId, studId, timelineId, applicationId, amount);
    res.status(201).json({ status: "success", message: "Form submitted successfully", data });
  } catch (err) {
    res.status(err.status || 500).json({ status: "failed", message: err.message });
  }
};

/**
 * Bulk submit:
 * POST /bulk-forms/:studId/:formId
 * body: { forms: [schoolId1, schoolId2], applicationId?: "<applicationId>" }
 */
export const submitBulkForms = async (req, res) => {
  try {
    const { studId, formId } = req.params;
    const { forms, applicationId } = req.body;

    const data = await submitBulkFormsService(studId, forms, formId, applicationId || null);
    res.status(201).json({ status: "success", message: "Bulk forms submitted", data });
  } catch (err) {
    res.status(err.status || 500).json({ status: "failed", message: err.message });
  }
};
export const updateFormStatus = async (req, res) => {
  try {
    const { formId } = req.params;
    const { status, note } = req.body;

    if (status === "Interview" && (!note || note.trim() === "")) {
      return res.status(400).json({
        status: "failed",
        message: "An interview note is required when the status is 'Interview'.",
      });
    }

    const data = await updateFormStatusService(formId, status, note);

    res.status(200).json({
      status: "success",
      message: "Form status updated",
      data,
    });
  } catch (err) {
    console.error("Error caught in controller:", err);
    res.status(err.status || 500).json({
      status: "failed",
      message: err.message,
    });
  }
};
export const deleteForm = async (req, res) => {
  try {
    const { formId } = req.params;

    const data = await deleteFormService(formId);
    res.status(200).json({ status: "success", message: "Form deleted successfully", data });
  } catch (err) {
    res.status(err.status || 500).json({ status: "failed", message: err.message });
  }
};

/**
 * Check if a form is applied.
 * Endpoint: GET /is-applied/:studId/:schoolId
 * Optional applicationId can be passed as query param to check for a specific StudentApplication:
 * GET /is-applied/:studId/:schoolId?applicationId=<id>
 */
export const isFormApplied = async (req, res) => {
  try {
    const { studId, collegeId } = req.params;
    const applicationId = req.query.applicationId || null;

    const data = await getIsFormApplied(studId, collegeId, applicationId);
    res.status(200).json({ status: "success", message: "Form application status fetched", data });
  } catch (err) {
    res.status(err.status || 500).json({ status: "failed", message: err.message });
  }
};
export const getFormsByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.query;

    const data = await getFormsByApplicationService(applicationId, status || null);
    res.status(200).json({ status: "success", message: "Forms fetched for application", data });
  } catch (err) {
    console.error("Error in getFormsByApplication:", err);
    res.status(err.status || 500).json({ status: "failed", message: err.message || "Internal server error" });
  }
};