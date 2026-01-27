import {
  getHostelsByCollegeIdService,
  addHostelService,
  updateHostelService,
  deleteHostelService,
} from "../services/hostel-service.js";
import mongoose from "mongoose";

/**
 * GET /api/hostels/college/:collegeId
 */
export const getHostelsByCollegeId = async (req, res) => {
    console.log("RAW PARAMS =>", req.params);
  console.log("collegeId =>", req.params.collegeId);
  console.log("isValidObjectId =>", mongoose.Types.ObjectId.isValid(req.params.collegeId));
  try {
    const { collegeId } = req.params;

    const hostels =
      await getHostelsByCollegeIdService(collegeId);

    return res.status(200).json({
      success: true,
      data: hostels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/hostels
 */
export const addHostel = async (req, res) => {
  try {
    const hostel = await addHostelService(req.body);

    return res.status(201).json({
      success: true,
      data: hostel,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUT /api/hostels/:id
 */
export const updateHostel = async (req, res) => {
  try {
    const hostel = await updateHostelService(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      data: hostel,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/hostels/:id
 */
export const deleteHostel = async (req, res) => {
  try {
    const hostel =
      await deleteHostelService(req.params.id);

    return res.status(200).json({
      success: true,
      data: hostel,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
