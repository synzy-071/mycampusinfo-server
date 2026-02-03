import College from "../models/school_details/college_model.js";
import { toCollegeCardModels } from "../utils/utils.js";
import Course from "../models/school_details/course-model.js"
import CourseExam from "../models/school_details/exam-model.js"

import CoursePlacement from "../models/school_details/placement_model.js"
import mongoose from "mongoose";
/* ADD COLLEGE */
export const createCollegeService = async (data) => {
  const {
    authId, name, city, state, country, ranking, estYear, lat, long,
    area, acceptanceRate, collegeInfo, address, pinCode, collegeMode,
    genderType, shifts, feeRange, stream, email, mobileNo, specialist, tags,
    website, status, languageMedium, transportAvailable, TeacherToStudentRatio,
    score, instagramHandle, twitterHandle, linkedinHandle

  } = data;

  const college = new College({
    _id: new mongoose.Types.ObjectId(authId), authId, name, city, state, country, ranking, estYear, lat, long, area,
    acceptanceRate, collegeInfo, address, pinCode, collegeMode, genderType,
    shifts, feeRange, stream, email, mobileNo, specialist, tags, website, status,
    languageMedium, transportAvailable, TeacherToStudentRatio, score, instagramHandle,
    twitterHandle, linkedinHandle
  });

  return await college.save();
};

/* GET ALL COLLEGES */
export const getAllCollegesService = async () => {
  let colleges =
    await College.find().sort({ createdAt: -1 });
  let mapColleges = await toCollegeCardModels(colleges);
  return mapColleges;
};


/* GET COLLEGE BY AUTH ID */
export const getCollegeByIdService = async (collegeId) => {
  const college = await College.findById(collegeId);
  const courses = await Course.find({ collegeId: college._id });
  const allExams = [];

  let highestPackage = 0; 
  let topCompanies = []; 
  const courseSchema = [];
  for (let course of courses) {
    const exams = await CourseExam.find({ courseId: course._id });
    for (let exam of exams) {
      if (exam?.examName) {
        allExams.push(exam.examName);
      }
    }
     const placements = await CoursePlacement.find({
      courseId: course._id,
    });

    for (const placement of placements) {
      courseSchema.push(placement);

      // 🔥 compute max package
      if (placement.maxPackage > highestPackage) {
        highestPackage = placement.maxPackage;
        topCompanies=placement.companies;
      }}


  }
  return { college, courseCount: courses.length, allExams,highestPackage ,topCompanies};

};



/* UPDATE BY AUTH ID */
export const updateCollegeByAuthIdService = async (authId, data) => {
  return await College.findOneAndUpdate({ authId }, data, { new: true });
};


/* DELETE BY AUTH ID */
export const deleteCollegeByAuthIdService = async (authId) => {
  return await College.findOneAndDelete({ authId });
};
