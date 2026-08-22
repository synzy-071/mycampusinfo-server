import {
  createCollegeService,
  getAllCollegesService,
  getCollegeByIdService,
 updateCollegeByIdService,
  deleteCollegeByAuthIdService,
    uploadCollegePhotosService,
  uploadCollegeLogoService,
  uploadCollegeVideoService,
  deleteCollegePhotoService,
  getCollegesByStatusService,
  getPendingCollegesService,
} from "../services/college-service.js";

/* ADD */
export const addCollege = async (req, res) => {
  try {
    const college = await createCollegeService(req.body);
    res.status(201).json({ success: true, message: "College added", data: college });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET ALL */
export const getColleges = async (req, res) => {
  try {
    const colleges = await getAllCollegesService();
    res.json({ success: true, data: colleges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET BY STATUS */
export const getCollegesByStatus = async (req, res) => {
  try {
    const colleges = await getCollegesByStatusService(req.params.status);
    if (!colleges || colleges.length === 0) {
      return res.status(200).json({ success: true, data: [], message: 'No colleges found with status' });
    }
    res.json({ success: true, data: colleges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET PENDING */
export const getPendingColleges = async (req, res) => {
  try {
    const colleges = await getPendingCollegesService();
    res.json({ success: true, data: colleges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// /* GET BY AUTH ID */
// export const getCollegeByAuthId = async (req, res) => {
//   try {
//     const college = await getCollegeByAuthIdService(req.params.authId);
//     if (!college) return res.status(404).json({ success: false, message: "College not found" });
//     res.json({ success: true, data: college });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const getCollegeById = async (req, res) => {
  try {
    const college = await getCollegeByIdService(req.params.collegeId);
    if (!college) return res.status(404).json({ success: false, message: "College not found" });
    res.json({ success: true, data: college });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



/* UPDATE BY AUTH ID */
export const updateCollegeById = async (req, res) => {
  try {
    const updated = await updateCollegeByIdService(
      req.params.collegeId,
      req.body
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "College not found" });

    res.json({ success: true, message: "College updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




/* DELETE BY AUTH ID */
export const deleteCollegeByAuthId = async (req, res) => {
  try {
    const deleted = await deleteCollegeByAuthIdService(req.params.authId);
    if (!deleted) return res.status(404).json({ success: false, message: "College not found" });
    res.json({ success: true, message: "College deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadCollegePhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: "No files uploaded" });

    const college = await uploadCollegePhotosService(req.params.collegeId, req.files);
    res.json({ success: true, message: "Photos uploaded", data: college });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const uploadCollegeLogo = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const college = await uploadCollegeLogoService(req.params.collegeId, req.file);
    res.json({ success: true, message: "Logo uploaded", data: college });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const uploadCollegeVideo = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const college = await uploadCollegeVideoService(req.params.collegeId, req.file);
    res.json({ success: true, message: "Video uploaded", data: college });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const deleteCollegePhoto = async (req, res) => {
  try {
    const college = await deleteCollegePhotoService(req.params.collegeId, req.params.publicId);
    res.json({ success: true, message: "Photo deleted", data: college });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};