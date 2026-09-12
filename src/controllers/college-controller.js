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

/* REVERSE GEOCODE */
export const reverseGeocodeCollegeController = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    const latitude = Number(lat).toFixed(6);
    const longitude = Number(lon).toFixed(6);

    let city = "";
    let state = "";
    let country = "India";
    let pincode = "";
    let area = "";
    let address = "";

    // 1. Try Nominatim with timeout and custom User-Agent
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
      const response = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "SynzyCollegeApp/1.0 (contact@synzy.com)",
          "Accept-Language": "en",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
        state = addr.state || "";
        country = addr.country || "India";
        pincode = addr.postcode || "";
        area = addr.suburb || addr.neighbourhood || addr.locality || addr.district || "";
        const street = [addr.house_number, addr.road || addr.pedestrian].filter(Boolean).join(" ");
        address = [street, area, city, state, pincode].filter(Boolean).join(", ") || data.display_name || "";
      }
    } catch (nomErr) {
      console.warn("Nominatim reverse geocode failed, trying fallbacks:", nomErr.message);
    }

    // 2. Fallback to Photon if pincode or city or address is missing
    if (!pincode || !city || !address) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const photonRes = await fetch(
          `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (photonRes.ok) {
          const photonData = await photonRes.json();
          const props = photonData?.features?.[0]?.properties;
          if (props) {
            if (!pincode && props.postcode) pincode = String(props.postcode);
            if (!city) city = props.city || props.district || props.county || props.locality || "";
            if (!state) state = props.state || "";
            if (!country) country = props.country || "India";
            if (!area) area = props.locality || props.district || props.county || "";
            if (!address && (props.street || props.name)) {
              address = [props.name, props.street, area, city, state, pincode].filter(Boolean).join(", ");
            }
          }
        }
      } catch (photonErr) {
        console.warn("Photon fallback failed:", photonErr.message);
      }
    }

    // 3. Fallback to BigDataCloud for administrative boundaries (city, state, country)
    if (!city || !state || !pincode) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const bdcRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (bdcRes.ok) {
          const bdcData = await bdcRes.json();
          if (bdcData) {
            if (!city) city = bdcData.city || bdcData.locality || "";
            if (!state) state = bdcData.principalSubdivision || "";
            if (!country) country = bdcData.countryName || "India";
            if (!pincode && bdcData.postcode) pincode = String(bdcData.postcode);
            if (!area && bdcData.locality) area = bdcData.locality;
          }
        }
      } catch (bdcErr) {
        console.warn("BigDataCloud fallback failed:", bdcErr.message);
      }
    }

    // Ensure address is non-empty if we have area/city/state
    if (!address) {
      address = [area, city, state, pincode].filter(Boolean).join(", ");
    }

    return res.status(200).json({
      success: true,
      data: {
        latitude,
        longitude,
        address,
        area,
        city,
        state,
        country: country || "India",
        pincode,
      },
    });
  } catch (error) {
    console.error("Reverse geocoding controller error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};