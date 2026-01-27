import Hostel from "../models/school_details/hostel-model.js";
import mongoose from "mongoose";

/**
 * Get all hostels by collegeId
 */
export const getHostelsByCollegeIdService = async (collegeId) => {
  return await Hostel.find({
    collegeId: new mongoose.Types.ObjectId(collegeId),
    isActive: true,
  }).sort({ createdAt: -1 });
};

/**
 * Add hostel
 */
export const addHostelService = async (data) => {
  const hostel = new Hostel(data);
  return await hostel.save();
};

/**
 * Update hostel
 */
export const updateHostelService = async (hostelId, data) => {
  return await Hostel.findByIdAndUpdate(
    hostelId,
    data,
    { new: true }
  );
};

/**
 * Delete hostel (soft delete)
 */
export const deleteHostelService = async (hostelId) => {
  return await Hostel.findByIdAndUpdate(
    hostelId,
    { isActive: false },
    { new: true }
  );
};
