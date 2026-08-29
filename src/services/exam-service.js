import CourseExam from "../models/school_details/exam-model.js";
import Course from "../models/school_details/course-model.js";
import mongoose from "mongoose";

export const addCourseExamsService = async (courseId, exams) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw { status: 400, message: "Invalid courseId" };
  }

  if (!Array.isArray(exams) || exams.length === 0) {
    throw { status: 400, message: "Exams must be a non-empty array" };
  }

  await CourseExam.deleteMany({ courseId });

  return await CourseExam.insertMany(
    exams.map(e => ({ ...e, courseId }))
  );
};

/**
 * ✅ COLLEGE → COURSES → EXAMS
 */
export const getCollegeExamsService = async (collegeId) => {
  if (!mongoose.Types.ObjectId.isValid(collegeId)) {
    throw { status: 400, message: "Invalid collegeId" };
  }

  // 1️⃣ Get courses of college
  const courses = await Course.find(
    { collegeId },
    { _id: 1, courseName: 1 }
  ).lean();

  if (!courses.length) return [];

  const courseIds = courses.map(c => c._id);

  // 2️⃣ Get exams for those courses
  const exams = await CourseExam.find({
    courseId: { $in: courseIds },
  }).lean();

  // 3️⃣ Attach courseName
  const courseMap = {};
  courses.forEach(c => {
    courseMap[c._id.toString()] = c.courseName;
  });

  return exams.map(e => ({
    ...e,
    courseName: courseMap[e.courseId.toString()],
  }));
};
