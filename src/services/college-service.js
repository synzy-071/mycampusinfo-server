import College from "../models/school_details/college_model.js";
import { toCollegeCardModels } from "../utils/utils.js";
import Course from "../models/school_details/course-model.js"
import CourseExam from "../models/school_details/exam-model.js"

import CoursePlacement from "../models/school_details/placement_model.js"
import mongoose from "mongoose";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
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
export const updateCollegeByIdService = (collegeId, data) => {
  return College.findByIdAndUpdate(collegeId, data, { new: true });
};


/* DELETE BY AUTH ID */
export const deleteCollegeByAuthIdService = async (authId) => {
  return await College.findOneAndDelete({ authId });
};

/* UPLOAD PHOTOS */
export const uploadCollegePhotosService = async (collegeId, files) => {
  const college = await College.findById(collegeId);
  if (!college) throw Object.assign(new Error("College not found"), { statusCode: 404 });

  const uploadPromises = files.map(file => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "colleges/photos", resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  }));

  const uploadedPhotos = await Promise.all(uploadPromises);
  college.photos.push(...uploadedPhotos);
  await college.save();
  return college;
};

/* UPLOAD LOGO */
export const uploadCollegeLogoService = async (collegeId, file) => {
  const college = await College.findById(collegeId);
  if (!college) throw Object.assign(new Error("College not found"), { statusCode: 404 });

  // Delete old logo from cloudinary if exists
  if (college.logo?.publicId) {
    await cloudinary.uploader.destroy(college.logo.publicId);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "colleges/logos", resource_type: "image" },
      async (error, result) => {
        if (error) return reject(error);
        college.logo = { url: result.secure_url, publicId: result.public_id };
        await college.save();
        resolve(college);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

/* UPLOAD VIDEO */
export const uploadCollegeVideoService = async (collegeId, file) => {
  const college = await College.findById(collegeId);
  if (!college) throw Object.assign(new Error("College not found"), { statusCode: 404 });

  // Delete old video from cloudinary if exists
  if (college.videos?.publicId) {
    await cloudinary.uploader.destroy(college.videos.publicId, { resource_type: "video" });
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "colleges/videos", resource_type: "video" },
      async (error, result) => {
        if (error) return reject(error);
        college.videos = { url: result.secure_url, publicId: result.public_id };
        await college.save();
        resolve(college);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

/* DELETE PHOTO */
export const deleteCollegePhotoService = async (collegeId, publicId) => {
  await cloudinary.uploader.destroy(publicId);
  const college = await College.findByIdAndUpdate(
    collegeId,
    { $pull: { photos: { publicId } } },
    { new: true }
  );
  if (!college) throw Object.assign(new Error("College not found"), { statusCode: 404 });
  return college;
};