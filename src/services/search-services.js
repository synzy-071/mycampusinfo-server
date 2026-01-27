import College from "../models/school_details/college_model.js";

export const searchCollegesService = async ({ search, streams, cities, state, collegeMode, genderType, feeRange, page, limit }) => {
  const streamArrays = streams ? (Array.isArray(streams) ? streams : streams.split(",")) : [];
  const stateArray = state ? (Array.isArray(state) ? state : state.split(",")) : [];
  const cityArray = cities ? (Array.isArray(cities) ? cities : cities.split(",")) : [];
  const modeArray = collegeMode ? (Array.isArray(collegeMode) ? collegeMode : collegeMode.split(",")).map(m => m.toLowerCase()) : [];
  const genderArray = genderType ? (Array.isArray(genderType) ? genderType : genderType.split(",")).map(g => g.toLowerCase()) : [];
  const feeArray = feeRange ? (Array.isArray(feeRange) ? feeRange : feeRange.split(",")) : [];

  const validStreams = [
    'Engineering', 'Management', 'Arts', 'Science', 'Law', 'Medical', 'Design', 'Humanities',
  ];

  const invalidStreams = streamArrays.filter(s => !validStreams.includes(s));
  if (invalidStreams.length > 0) {
    throw { status: 400, message: `Invalid stream(s): ${invalidStreams.join(", ")}. Allowed: ${validStreams.join(", ")}` };
  }

  let query = {};
  if (search && search.trim() !== "") {
    query.name = { $regex: new RegExp(search, "i") };
  }
  if (streamArrays.length > 0) query.stream = { $in: streamArrays };
  if (cityArray.length > 0) query.city = { $in: cityArray };
  if (stateArray.length > 0) query.state = { $in: stateArray };
  if (modeArray.length > 0) query.collegeMode = { $in: modeArray };
  if (genderArray.length > 0) query.genderType = { $in: genderArray };
  if (feeArray.length > 0) query.feeRange = { $in: feeArray };

  const skip = (page - 1) * limit;

  const colleges = await College.find(query).skip(skip).limit(limit);
  const total = await College.countDocuments(query);

  let sorted = colleges;
  if (search && search.trim() !== "") {
    const searchLower = search.toLowerCase();
    sorted = colleges.sort((a, b) => {
      const aName = (a.name || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();
      if (aName.startsWith(searchLower)) return -1;
      if (bName.startsWith(searchLower)) return 1;
      return 0;
    });
  }

  return {
    data: sorted,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};