import College from '../models/school_details/college_model.js'
import Activities from '../models/school_details/activity_model.js';
import { parseFeeRange,parseClassLevel } from '../utils/fee-parsing.js';

export const predictCollegesService = async (filters) => {
  const {
    stream,
    state,
    city,
    collegeMode,
    genderType,
    shifts = [],
    feeRange,
    upto,
    specialist = [], //Optional
    languageMedium = [],
    transportAvailable,
    activities = []
  } = filters;

  const query = {
    ///TODO: Uncomment once status is added
    // status: 'accepted',
    ...(stream && { stream }),
    ...(state && { state }),
    ...(city && { city }),
    ...(collegeMode && { collegeMode }),
    ...(genderType && { genderType }),
    ...(shifts.length > 0 && { shifts: { $in: shifts } }),
    ...(specialist.length > 0 && { specialist: { $in: specialist } }),
    ...(languageMedium.length > 0 && { languageMedium: { $in: languageMedium } }),
    ...(transportAvailable && { transportAvailable })
  };

  let matchedColleges = await College.find(query);
  if (upto) {
  const userClassLevel = parseClassLevel(upto);

  matchedColleges = matchedColleges.filter((college) => {
    const collegeClassLevel = parseClassLevel(college.upto);
    return collegeClassLevel && collegeClassLevel >= userClassLevel;
  });
}

  if (feeRange) {
  const userRange = parseFeeRange(feeRange);
 
  matchedColleges = matchedColleges.filter((college) => {
    const collegeRange = parseFeeRange(college.feeRange);
   
    if (!collegeRange) return false;
    return (
      collegeRange.max >= userRange.min && collegeRange.min <= userRange.max
    );
  });
}


  if (activities.length > 0) {
    const activityDocs = await Activities.find({
      activities: { $in: activities },
      collegeId: { $in: matchedColleges.map((s) => s._id) },
    });

     const collegeIdsWithActivities = activityDocs.map((a) =>
      a.collegeId.toString()
    );

    matchedColleges = matchedColleges.filter((s) =>
      collegeIdsWithActivities.includes(s._id.toString())
    );
  }

  return matchedColleges;
};