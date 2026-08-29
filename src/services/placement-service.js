import CoursePlacement from "../models/school_details/placement_model.js";
import Course from "../models/school_details/course-model.js";

/* ================= ADD ================= */
export const addCoursePlacementService = async (data) => {
  if (data.placements && Array.isArray(data.placements)) {
    // Delete existing placements for this course
    await CoursePlacement.deleteMany({ courseId: data.courseId });
    // Insert new placements
    return await CoursePlacement.insertMany(
      data.placements.map(p => ({ ...p, courseId: data.courseId }))
    );
  } else {
    // Fallback for single placement
    return await CoursePlacement.findOneAndUpdate(
      { courseId: data.courseId, year: data.year },
      { $set: data },
      { new: true, upsert: true }
    );
  }
};

/* ================= GET BY COURSE ================= */
export const getCoursePlacementsService = async (courseId) => {
  return await CoursePlacement.find({ courseId }).sort({ year: -1 });
};

/* ================= GET BY COLLEGE (NEW & IMPORTANT) ================= */
export const getPlacementsByCollegeService = async (collegeId) => {
  // 1️⃣ Get courses of the college
  const courses = await Course.find({ collegeId }).select("_id courseName");

  if (!courses.length) return [];

  const courseIds = courses.map((c) => c._id);

  // 2️⃣ Get placements for those courses
  const placements = await CoursePlacement.find({
    courseId: { $in: courseIds },
  }).sort({ year: -1 });

  // 3️⃣ Group by course
  return courses.map((course) => ({
    courseId: course._id,
    courseName: course.courseName,
    placements: placements.filter(
      (p) => p.courseId.toString() === course._id.toString()
    ),
  }));
};

/* ================= UPDATE ================= */
export const updateCoursePlacementService = async (placementId, data) => {
  const updated = await CoursePlacement.findByIdAndUpdate(
    placementId,
    data,
    { new: true }
  );

  if (!updated) throw { status: 404, message: "Placement not found" };
  return updated;
};
