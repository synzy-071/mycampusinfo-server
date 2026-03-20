import CourseFee from "../models/school_details/fees-model.js";
import Course from "../models/school_details/course-model.js";
import mongoose from "mongoose";

/**
 * 🔹 Add / Update Course Fee (course-based)
 */
export const upsertCourseFeeService = async (dataArray) => {
  if (!Array.isArray(dataArray)) {
    throw { status: 400, message: "Expected an array of course fees" };
  }

  const results = [];

  for (const data of dataArray) {
    const { courseId } = data;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw { status: 400, message: `Invalid courseId: ${courseId}` };
    }

    const updated = await CourseFee.findOneAndUpdate(
      { courseId },
      data,
      { upsert: true, new: true }
    );

    results.push(updated);
  }

  return results;
};
/**
 * 🔹 Get all course fees by College ID
 */
export const getCourseFeesByCollegeIdService = async (collegeId) => {
  if (!mongoose.Types.ObjectId.isValid(collegeId)) {
    throw { status: 400, message: "Invalid collegeId" };
  }

  // 1️⃣ Get all courses of this college
  const courses = await Course.find(
    { collegeId },
    { _id: 1 }
  );

  if (!courses.length) return [];

  const courseIds = courses.map(c => c._id);

  // 2️⃣ Get fees for those courses
  const fees = await CourseFee.find({
    courseId: { $in: courseIds },
  }).populate("courseId", "courseName");

  return fees;
};
