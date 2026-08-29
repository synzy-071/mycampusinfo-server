import Student from "../models/user/user-model.js";
import mongoose from "mongoose";
import College from "../models/school_details/college_model.js";

import { toCollegeCardModels } from "../utils/utils.js";

// ✅ Add School to Shortlist
export const addToShortlistService = async ({ authId, collegeId }) => {
  if (!authId || !collegeId) {
     throw {status:400, message:"authId and collegeId are required"};
  }

  const student = await Student.findOne({ authId: new mongoose.Types.ObjectId(authId) });
  if (!student) {
    throw {status:400, message:"Student not found"};
  }

  const school = await College.findById(collegeId);
  if (!school) {
     throw {status:400, message:"School not found"};
     
  }

  if (student.shortlistedSchools.some(id => id.toString() === collegeId.toString())) {
    throw {status:400, message:"School already in shortlist"};
  }

  student.shortlistedSchools.push(collegeId);
  await student.save();

  return student.shortlistedSchools;
};

// ✅ Get Shortlisted Schools
export const getShortlistedSchoolsService = async (authId) => {
  const student = await Student.findOne({ authId }).populate("shortlistedSchools");
  if (!student) {
    throw {status:400, message:"Student not found"};
  }

   const mapped = toCollegeCardModels(student.shortlistedSchools);


  return mapped;
};

// ✅ Remove School from Shortlist
export const removeShortlistService = async ({ authId, collegeId }) => {
  if (!authId || !collegeId) {
    throw {status:400, message:"authId and collegeId are required"};
  }

  const student = await Student.findOne({ authId: new mongoose.Types.ObjectId(authId) });
  if (!student) {
    throw {status:400, message:"Student not found"};
  }

  student.shortlistedSchools = student.shortlistedSchools.filter(
    (id) => id.toString() !== collegeId.toString()
  );

  await student.save();
  return student.shortlistedSchools;
};

// ✅ Get Count of Shortlisted Schools
export const getShortlistCountService = async (authId) => {
  const student = await Student.findOne({ authId });
  if (!student) {
    throw {status:400, message:"Student not found"};
  }

  return student.shortlistedSchools.length;
};
