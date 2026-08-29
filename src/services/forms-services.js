// services/forms-services.js
import Form from "../models/application/form-model.js";
import Student from "../models/user/user-model.js";
import College from "../models/school_details/college_model.js";
import AdmissionTimeline from "../models/school_details/admission-timeline-model.js";
import StudentApplication from "../models/application/application-model.js";
import Auth from "../models/auth/auth-model.js";
import Notification from "../models/notification/notifications-model.js";
import { pushNotification } from "../utils/send-notification.js";

/**
 * Get forms for a studId (all forms created by that account).
 * Optional `status` to filter.
 */export const getFormsByStudentService = async (studId, status) => {
  const query = { studId };
  if (status) query.status = status;

  const forms = await Form.find(query)
    .populate({ path: "applicationForm", select: "pdfFile" })
    .populate({ path: "applicationId", select: "name studId" })
    .populate({
      path: "collegeId",
      select: "name collegeMode genderType shifts state city",
    })
    .populate({ path: "studId", select: "name" })
    .sort({ createdAt: -1 });

  for (const form of forms) {
    const admissionTimeline = await AdmissionTimeline.findOne({
      collegeId: form.collegeId,
      "timelines._id": form.timelineId,
    });

    // Timeline may have been deleted or no longer exists.
    // Skip instead of crashing the API.
    if (!admissionTimeline) {
      form.timelineId = null;
      continue;
    }

    const timeline = admissionTimeline.timelines.find(
      (t) => t._id.toString() === form.timelineId.toString()
    );

    await form.populate({
      path: "timelineId",
      select:
        "admissionStartDate admissionEndDate status applicationFee courseId documentsRequired eligibility",
    });

    form.timelineId = timeline ?? null;
  }

  return forms;
};
export const getFormsByTimelineService = async (timelineId, status) => {
  const query = { timelineId };
  if (status) query.status = status;

  const forms = await Form.find(query)
    .populate({ path: 'applicationForm', select: 'pdfFile' })
    .populate({ path: 'applicationId', select: 'name studId' })
    .populate({ path: 'collegeId', select: 'name collegeMode genderType shifts state city' })
    .populate({ path: 'studId', select: 'name' })
    .sort({ createdAt: -1 });

  for (const form of forms) {
    const admissionTimeline = await AdmissionTimeline.findOne({ collegeId: form.collegeId, 'timelines._id': form.timelineId });
    const timelines = admissionTimeline.timelines;
    const timeline = timelines.find(t => t._id.toString() === form.timelineId.toString());
    const populatedForm = await form.populate({
      path: 'timelineId',
      select: 'admissionStartDate admissionEndDate status applicationFee courseId documentsRequired eligibility'
    });
    form.timelineId = timeline;
  }

  return forms;
};

/**
 * Get forms submitted to a college (optionally filtered by status).
 */
export const getFormsBySchoolService = async (collegeId, status) => {
  const query = { collegeId };
  if (status) query.status = status;

  const forms = await Form.find(query)
    .populate({ path: 'applicationForm', select: 'pdfFile' })
    .populate({ path: 'applicationId', select: 'name studId' })
    .populate({ path: 'studId', select: 'name email' })
    .sort({ createdAt: -1 });

  for (const form of forms) {
    const admissionTimeline = await AdmissionTimeline.findOne({ collegeId: form.collegeId, 'timelines._id': form.timelineId });
    if(!admissionTimeline) continue; // skip if no admission timeline found for this college
    const timelines = admissionTimeline.timelines;
    const timeline = timelines.find(t => t._id.toString() === form.timelineId.toString());
    const populatedForm = await form.populate({
      path: 'timelineId',
      select: 'admissionStartDate admissionEndDate status applicationFee courseId documentsRequired eligibility'
    });
    form.timelineId = timeline;
  }

  return forms;
};

export const trackFormService = async (formId) => {
  const form = await Form.findById(formId)
    .populate({ path: "collegeId", select: "name" })
    .populate({ path: "studId", select: "pdfFile" })
    .populate({ path: "applicationId", select: "name" });

  if (!form) throw { status: 404, message: "Form not found" };
  return form;
};

export const getFormDetailsService = async (formId) => {
  const form = await Form.findById(formId)
    .populate({ path: 'applicationForm', select: 'pdfFile' })
    .populate({ path: 'collegeId', select: 'name collegeMode genderType shifts state city' })
    .populate({ path: 'studId', select: 'name email contactNo dateOfBirth gender' })
    .populate({ path: 'applicationId' });

  if (!form) throw { status: 404, message: "Form not found" };

  const admissionTimeline = await AdmissionTimeline.findOne({ collegeId: form.collegeId, 'timelines._id': form.timelineId });
  const timelines = admissionTimeline.timelines;
  const timeline = timelines.find(t => t._id.toString() === form.timelineId.toString());
  const populatedForm = await form.populate({
    path: 'timelineId',
    select: 'admissionStartDate admissionEndDate status applicationFee courseId documentsRequired eligibility'
  });
  form.timelineId = timeline;

  return form;
};

/**
 * Submit a single form to a school.
 * Prefer `applicationId` if provided (ties the form to a particular StudentApplication),
 * otherwise fallback to old behavior using studId only.
 *
 * @param {ObjectId} formId - pdf/form template id
 * @param {ObjectId} collegeId
 * @param {ObjectId} studId - account owner
 * @param {ObjectId} timelineId - account owner
 * @param {ObjectId|null} applicationId - StudentApplication _id (optional)
 */
export const submitFormService = async (formId, collegeId, studId, timelineId, applicationId = null, amount) => {
  // Validate student & college exist
  const student = await Student.findById(studId);
  if (!student) throw { status: 404, message: "Student not found" };

  const college = await College.findById(collegeId);
  if (!college) throw { status: 404, message: "College not found" };

  const timeline = await AdmissionTimeline.findOne({ collegeId, 'timelines._id': timelineId });
  if (!timeline) throw { status: 404, message: "Timeline not found" };

  // If applicationId provided, ensure it exists and belongs to studId
  if (applicationId) {
    const app = await StudentApplication.findById(applicationId);
    if (!app) throw { status: 404, message: "Student application not found" };
    if (app.studId.toString() !== studId.toString()) {
      throw { status: 400, message: "applicationId does not belong to the studId" };
    }
  }

  // Check existing submission (prefer applicationId)
  let existingForm;
  if (applicationId) {
    existingForm = await Form.findOne({ applicationForm: formId, collegeId, applicationId, timelineId });
  } else {
    existingForm = await Form.findOne({ applicationForm: formId, collegeId, studId, timelineId });
  }
  if (existingForm) throw { status: 409, message: "Form already submitted to this school for this application" };

  const form = await Form.create({ applicationForm: formId, collegeId, studId, applicationId: applicationId || null, amount, timelineId });

  // // Notification
  // await createNotificationService({
  //   title: `Form Submitted`,
  //   body: `You have successfully submitted a form to ${school.name}`,
  //   authId: student.authId,
  //   notificationType: 'Submitted'
  // });

  return form;
};

/**
 * Bulk submit: `forms` is array of collegeIds.
 * Optional `applicationId` to submit for a particular StudentApplication.
 */
export const submitBulkFormsService = async (studId, forms, formId, applicationId = null) => {
  if (!Array.isArray(forms) || forms.length === 0) {
    throw { status: 400, message: "Forms must be a non-empty array" };
  }

  const submittedForms = [];
  for (const collegeId of forms) {
    // check duplicates per school
    let existing;
    if (applicationId) {
      existing = await Form.findOne({ applicationForm: formId, collegeId, applicationId });
    } else {
      existing = await Form.findOne({ applicationForm: formId, collegeId, studId });
    }
    if (existing) continue; // skip duplicate
    const created = await Form.create({ applicationForm: formId, collegeId, studId, applicationId: applicationId || null });
    submittedForms.push(created);
  }

  return submittedForms;
};

/**
 * Update status (and optional interview note)
 */
export const updateFormStatusService = async (formId, status, note) => {
  const updateData = { status };

  if ((status === "Interview" || status === "WrittenExam") && note) {
    updateData.interviewNote = note;
  } else if (note) {
    updateData.note = note;
  }

  const form = await Form.findByIdAndUpdate(formId, updateData, {
    new: true,
  });

  if (!form) {
    throw { status: 404, message: "Form not found" };
  }

  const student = await Student.findById(form.studId);

  if (!student) {
    throw { status: 404, message: "Student not found for this form" };
  }

  const college = await College.findById(form.collegeId);

  if (!college) {
    throw { status: 404, message: "College not found for this form" };
  }

  const auth = await Auth.findById(student.authId);
console.log("========== UPDATE STATUS ==========");
console.log("Student ID:", student._id);
console.log("Student Auth ID:", student.authId);
console.log("Auth Found:", auth);
console.log("Device Token:", auth?.deviceToken);
console.log("Status:", status);
console.log("===================================");
  let title = "";
  let body = "";

  switch (status) {
    case "Accepted":
      title = "Application Accepted";
      body = `Your application to ${college.name} has been accepted.`;
      break;

    case "Rejected":
      title = "Application Rejected";
      body = `Your application to ${college.name} has been rejected.`;
      break;

    case "Reviewed":
      title = "Application Under Review";
      body = `Your application to ${college.name} is under review.`;
      break;

    case "Interview":
      title = "Interview Invitation";
      body = note
        ? `You've been invited for an interview at ${college.name}. Note: ${note}`
        : `You've been invited for an interview at ${college.name}.`;
      break;

    default:
      break;
  }

  if (title && body) {
    try {
      // Create in-app notification in DB
      await Notification.create({
        authId: student.authId,
        title,
        body,
        notificationType: status,
        data: {
          studentId: String(student._id),
          applicationId: String(form.applicationId || form._id),
          collegeId: String(college._id),
          status: String(status)
        },
        path: `/application-status` // Or link to the specific application page
      });
      console.log(`In-app Notification saved to database for ${student.name}`);
    } catch (dbErr) {
      console.error("Error creating Notification document:", dbErr);
    }
  }

  if (auth?.deviceToken && title) {
    try {
      await pushNotification({
        deviceToken: auth.deviceToken,
        title,
        body,
        data: {
          studentId: String(student._id),
          applicationId: String(form.applicationId || form._id),
          collegeId: String(college._id),
          status: String(status)
        }
      });

      console.log(`Notification sent to ${student.name}`);
    } catch (err) {
      console.error("Push notification failed:", err);
    }
  }

  return form;
};

export const deleteFormService = async (formId) => {
  const result = await Form.findByIdAndDelete(formId);
  if (!result) throw { status: 404, message: "Form not found" };
  return result;
};

/**
 * Check if a form is applied:
 * Prefer applicationId (if provided) otherwise fallback to studId.
 * Returns { isApplied: true, formId, status }
 */
export const getIsFormApplied = async (studId, collegeId, applicationId = null) => {
  let query;
  if (applicationId) {
    query = { applicationId, collegeId };
  } else {
    query = { studId, collegeId };
  }

  const form = await Form.findOne(query);
  if (!form) throw { status: 404, message: "No form application found for this student and school" };
  return { isApplied: true, formId: form._id, status: form.status };
};


export const getFormsByApplicationService = async (applicationId, status = null) => {
  if (!applicationId) {
    throw { status: 400, message: "applicationId is required" };
  }

  const query = { applicationId };
  if (status) query.status = status;

  const forms = await Form.find(query)
    .populate({ path: 'applicationForm', select: 'pdfFile' })
    .populate({ path: 'applicationId', select: 'name studId' })
    .populate({ path: 'collegeId', select: 'name schoolMode genderType shifts state city' })
    .populate({ path: 'studId', select: 'name email' })
    .sort({ createdAt: -1 });

  return forms;
};