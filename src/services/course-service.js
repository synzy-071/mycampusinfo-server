import Course from "../models/school_details/course-model.js";
import College from "../models/school_details/college_model.js";
import mongoose from "mongoose";

export const addCoursesService = async (collegeId, courses) => {
  if (!Array.isArray(courses) || courses.length === 0) {
    throw { status: 400, message: "Courses must be a non-empty array" };
  }

  const college = await College.findById(collegeId);
  if (!college) throw { status: 404, message: "College not found" };

  const savedCourses = [];

  for (const c of courses) {
    const { courseName, duration, intake, category } = c;

    if (!courseName) {
      throw { status: 400, message: "Missing required courseName" };
    }

    const course = await Course.create({
      collegeId,
      courseName,
      duration,
      intake,
      category,
    });

    savedCourses.push(course);
  }

  return savedCourses;
};

export const getCoursesByCollegeService = async (collegeId) => {
  if (!mongoose.Types.ObjectId.isValid(collegeId)) {
    throw { status: 400, message: "Invalid collegeId" };
  }

  return await Course.find({ collegeId });
};

export const updateCourseService = async (courseId, data) => {
  const updated = await Course.findByIdAndUpdate(courseId, data, {
    new: true,
  });

  if (!updated) throw { status: 404, message: "Course not found" };
  return updated;
};
