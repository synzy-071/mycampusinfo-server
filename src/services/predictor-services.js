import College from '../models/school_details/college_model.js';
import Activities from '../models/school_details/activity_model.js';
import Course from '../models/school_details/course-model.js';
import CourseExam from '../models/school_details/exam-model.js';
import { parseFeeRange } from '../utils/fee-parsing.js';

/**
 * Calculate distance in km between two GPS coordinates using the Haversine formula
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Build exam-matching criteria and state affinity
 */
const getExamCriteria = (examType) => {
  if (!examType || typeof examType !== 'string') return null;
  const clean = examType.trim().toLowerCase();

  if (clean.includes('eamcet') || clean.includes('emcet') || clean.includes('eapcet')) {
    if (clean.includes('ap') || clean.includes('andhra')) {
      return { regex: /eamcet\s*\(ap\)|eamcet|emcet|eapcet/i, stateFilter: /andhra/i, displayName: 'EAMCET (AP)' };
    }
    if (clean.includes('ts') || clean.includes('telangana')) {
      return { regex: /eamcet\s*\(ts\)|eamcet|emcet|eapcet/i, stateFilter: /telangana/i, displayName: 'EAMCET (TS)' };
    }
    return { regex: /eamcet|emcet|eapcet/i, stateFilter: /andhra|telangana/i, displayName: 'EAMCET' };
  }

  if (clean.includes('jee') && clean.includes('adv')) {
    return { regex: /jee\s*adv/i, stateFilter: null, displayName: 'JEE Advanced' };
  }

  if (clean.includes('jee')) {
    return { regex: /jee\s*main|jeemain/i, stateFilter: null, displayName: 'JEE Main' };
  }

  if (clean.includes('bitsat')) {
    return { regex: /bitsat/i, stateFilter: null, displayName: 'BITSAT' };
  }

  if (clean.includes('neet')) {
    return { regex: /neet/i, stateFilter: null, displayName: 'NEET' };
  }

  if (clean.includes('aiims')) {
    return { regex: /aiims|neet/i, stateFilter: null, displayName: 'AIIMS' };
  }

  if (clean.includes('mht')) {
    return { regex: /mht[-\s]?cet/i, stateFilter: /maharashtra/i, displayName: 'MHT-CET' };
  }

  if (clean.includes('kcet') || clean.includes('comedk')) {
    return { regex: /kcet|comedk/i, stateFilter: /karnataka/i, displayName: 'KCET / COMEDK' };
  }

  if (clean.includes('wbjee')) {
    return { regex: /wbjee/i, stateFilter: /bengal/i, displayName: 'WBJEE' };
  }

  if (clean.includes('cat')) {
    return { regex: /cat/i, stateFilter: null, displayName: 'CAT' };
  }

  if (clean.includes('mat')) {
    return { regex: /mat/i, stateFilter: null, displayName: 'MAT' };
  }

  if (clean.includes('state cet') || clean.includes('cet')) {
    return { regex: /state\s*cet|mht[-\s]?cet|kcet|eamcet|emcet/i, stateFilter: null, displayName: 'State CET' };
  }

  return {
    regex: new RegExp(clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    stateFilter: null,
    displayName: examType.trim()
  };
};

/**
 * Fallback closing cutoff estimator based on college ranking and score
 */
const estimateClosingRank = (college, examCriteria) => {
  const rankNum = parseInt(college.ranking, 10);
  const examName = examCriteria?.displayName?.toLowerCase() || '';

  if (examName.includes('adv')) {
    if (!isNaN(rankNum) && rankNum <= 5) return 2500;
    if (!isNaN(rankNum) && rankNum <= 20) return 8000;
    return 15000;
  }

  if (examName.includes('bitsat')) {
    if (!isNaN(rankNum) && rankNum <= 5) return 4000;
    return 18000;
  }

  if (examName.includes('eamcet')) {
    if (!isNaN(rankNum) && rankNum <= 10) return 18000;
    if (!isNaN(rankNum) && rankNum <= 50) return 45000;
    return 85000;
  }

  if (examName.includes('mht')) {
    if (!isNaN(rankNum) && rankNum <= 5) return 7500;
    return 25000;
  }

  if (examName.includes('neet')) {
    return 35000;
  }

  // Default for JEE Main / General
  if (!isNaN(rankNum) && rankNum > 0) {
    if (rankNum <= 5) return 5000;
    if (rankNum <= 15) return 25000;
    if (rankNum <= 30) return 30000;
    if (rankNum <= 50) return 55000;
    if (rankNum <= 500) return 80000;
    return 120000;
  }

  return 65000;
};

/**
 * Real database-driven college prediction service with strict Exam Type and Exam Rank matching
 */
export const predictCollegesService = async (filters = {}) => {
  const {
    stream,
    customStream,
    examType,
    examRank,
    state,
    city,
    collegeMode,
    genderType,
    shifts = [],
    feeRange,
    latitude,
    longitude,
    activities = []
  } = filters;

  // 1. Base query: only accepted colleges (and approved if any)
  const baseQuery = {
    status: { $in: ['accepted', 'approved'] }
  };

  if (state && typeof state === 'string' && state.trim()) {
    baseQuery.state = { $regex: new RegExp(`^${state.trim()}$`, 'i') };
  }

  if (city && typeof city === 'string' && city.trim()) {
    baseQuery.city = { $regex: new RegExp(city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
  }

  if (collegeMode && typeof collegeMode === 'string' && collegeMode.trim()) {
    baseQuery.collegeMode = { $regex: new RegExp(`^${collegeMode.trim()}$`, 'i') };
  }

  if (genderType && typeof genderType === 'string') {
    const normalizedGender = genderType.toLowerCase().trim();
    if (normalizedGender === 'boy' || normalizedGender === 'male') {
      baseQuery.genderType = { $in: ['boy', 'co-ed'] };
    } else if (normalizedGender === 'girl' || normalizedGender === 'female') {
      baseQuery.genderType = { $in: ['girl', 'co-ed'] };
    } else if (normalizedGender === 'co-ed') {
      baseQuery.genderType = 'co-ed';
    }
  }

  const shiftList = Array.isArray(shifts) ? shifts : (shifts ? [shifts] : []);
  const cleanShifts = shiftList.filter(Boolean).map(s => String(s).toLowerCase().trim());
  if (cleanShifts.length > 0) {
    baseQuery.shifts = { $in: cleanShifts };
  }

  // 2. Stream filtering
  const targetStream = (stream === 'Other' ? customStream : stream) || '';
  const cleanStream = typeof targetStream === 'string' ? targetStream.trim() : '';

  if (cleanStream && cleanStream.toLowerCase() !== 'all') {
    const streamRegex = new RegExp(cleanStream.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    baseQuery.$or = [
      { stream: { $regex: streamRegex } },
      { streamsOffered: { $elemMatch: { $regex: streamRegex } } },
      { streamsOffered: { $regex: streamRegex } }
    ];
  }

  let matchedColleges = await College.find(baseQuery);

  // If stream query was too strict, fallback to base query
  if (matchedColleges.length === 0 && cleanStream) {
    const relaxed = { ...baseQuery };
    delete relaxed.$or;
    matchedColleges = await College.find(relaxed);
  }

  // 3. Exam Type matching & Cutoff identification via CourseExam
  const examCriteria = getExamCriteria(examType);
  const collegeCutoffMap = new Map();

  if (examCriteria) {
    // Find all CourseExam records matching this exam name
    const courseExams = await CourseExam.find({
      examName: { $regex: examCriteria.regex }
    });

    if (courseExams.length > 0) {
      const courseIds = courseExams.map(ce => ce.courseId);
      const courses = await Course.find({ _id: { $in: courseIds } });

      for (const ce of courseExams) {
        const crs = courses.find(c => String(c._id) === String(ce.courseId));
        if (crs && crs.collegeId) {
          const colIdStr = String(crs.collegeId);
          const closingRank = ce.maxMarks || estimateClosingRank({}, examCriteria);
          const openingRank = ce.minMarks || 1;

          const existing = collegeCutoffMap.get(colIdStr);
          if (!existing || closingRank < existing.closingRank) {
            collegeCutoffMap.set(colIdStr, {
              examName: ce.examName,
              openingRank,
              closingRank
            });
          }
        }
      }
    }

    // Filter matched colleges by exam acceptance
    const examMatched = matchedColleges.filter(col => {
      const colIdStr = String(col._id);
      const hasCourseExam = collegeCutoffMap.has(colIdStr);

      // State-specific exams (e.g. EAMCET AP for Andhra Pradesh, EAMCET TS for Telangana, MHT-CET for Maharashtra)
      if (examCriteria.stateFilter) {
        return examCriteria.stateFilter.test(col.state || '') && hasCourseExam;
      }

      if (hasCourseExam) return true;

      // National Engineering entrance exams
      if (examCriteria.displayName === 'JEE Main' || examCriteria.displayName === 'JEE Advanced' || examCriteria.displayName === 'BITSAT') {
        return (col.stream === 'Engineering' || (col.streamsOffered && col.streamsOffered.includes('Engineering')));
      }

      return false;
    });

    if (examMatched.length > 0) {
      matchedColleges = examMatched;
    }
  }

  // Fee range filter
  if (feeRange) {
    const userRange = parseFeeRange(feeRange);
    if (userRange) {
      const feeFiltered = matchedColleges.filter((college) => {
        const collegeRange = parseFeeRange(college.feeRange);
        if (!collegeRange) return true;
        return collegeRange.max >= userRange.min && collegeRange.min <= userRange.max;
      });
      if (feeFiltered.length > 0) {
        matchedColleges = feeFiltered;
      }
    }
  }

  // 4. Score, Calculate Match Suitability against Candidate's Exam Rank
  const userRank = parseInt(examRank, 10);
  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);
  const hasUserLocation = !isNaN(userLat) && !isNaN(userLon);

  const scoredColleges = matchedColleges.map((col) => {
    const colObj = col.toObject ? col.toObject() : { ...col };
    const colIdStr = String(colObj._id);

    // Get exact cutoff from CourseExam or estimate
    const examData = collegeCutoffMap.get(colIdStr);
    const closingRank = examData?.closingRank || estimateClosingRank(colObj, examCriteria);
    const openingRank = examData?.openingRank || 100;
    const activeExam = examData?.examName || examCriteria?.displayName || 'Entrance Exam';

    let matchScore = 85;
    let admissionChance = 'High Chance';
    let scoreColorClass = 'text-green-600';
    let isRankEligible = true;

    if (!isNaN(userRank) && userRank > 0) {
      if (userRank <= closingRank) {
        // Candidate rank is well within or within the cutoff
        isRankEligible = true;
        const diffRatio = userRank / closingRank;
        if (diffRatio <= 0.4) {
          admissionChance = 'High Chance';
          matchScore = Math.min(99, Math.round(96 + (1 - diffRatio) * 3));
          scoreColorClass = 'text-green-600';
        } else if (diffRatio <= 0.8) {
          admissionChance = 'High Chance';
          matchScore = Math.round(88 + (1 - diffRatio) * 7);
          scoreColorClass = 'text-green-600';
        } else {
          admissionChance = 'Good Chance';
          matchScore = Math.round(80 + (1 - diffRatio) * 8);
          scoreColorClass = 'text-blue-600';
        }
      } else if (userRank <= closingRank * 1.35) {
        // Borderline / Moderate chance (Round 2 / Quota)
        isRankEligible = true;
        const excessRatio = (userRank - closingRank) / (closingRank * 0.35);
        admissionChance = 'Moderate Chance';
        matchScore = Math.max(65, Math.round(79 - excessRatio * 14));
        scoreColorClass = 'text-amber-600';
      } else {
        // Rank exceeds closing cutoff
        isRankEligible = false;
        const excessRatio = userRank / closingRank;
        admissionChance = 'Competitive / High Cutoff';
        matchScore = Math.max(25, Math.round(55 - excessRatio * 4));
        scoreColorClass = 'text-red-500';
      }
    } else if (colObj.score && colObj.score > 0) {
      matchScore = colObj.score;
    }

    colObj.acceptedExam = activeExam;
    colObj.closingRank = closingRank;
    colObj.openingRank = openingRank;
    colObj.cutoff = `Cutoff: ~${closingRank.toLocaleString('en-IN')}`;
    colObj.admissionChance = admissionChance;
    colObj.matchScore = matchScore;
    colObj.isRankEligible = isRankEligible;
    colObj.scoreDisplay = `${matchScore}% Match`;
    colObj.scoreColorClass = scoreColorClass;
    colObj.board = `${activeExam} (Cutoff: ~${closingRank.toLocaleString('en-IN')})`;
    colObj.collegeType = `${admissionChance}`;

    // Attach calculated distance if coordinates are present
    const colLat = typeof colObj.lat === 'number' ? colObj.lat : colObj.latitude;
    const colLon = typeof colObj.long === 'number' ? colObj.long : colObj.longitude;
    if (hasUserLocation && typeof colLat === 'number' && typeof colLon === 'number') {
      colObj.distanceKm = calculateHaversineDistance(userLat, userLon, colLat, colLon);
    }

    return colObj;
  });

  // 5. Intelligent Sorting:
  // - Colleges where user is eligible (High / Good / Moderate chance) appear first
  // - High chance colleges appear before competitive/out-of-range colleges
  // - If user location provided, distance is factored in
  scoredColleges.sort((a, b) => {
    // 1. Rank eligibility (eligible colleges first)
    if (a.isRankEligible !== b.isRankEligible) {
      return a.isRankEligible ? -1 : 1;
    }

    // 2. Proximity if location provided
    if (hasUserLocation && typeof a.distanceKm === 'number' && typeof b.distanceKm === 'number') {
      return a.distanceKm - b.distanceKm;
    }

    // 3. Match score (higher suitability first)
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }

    // 4. College ranking tie-breaker
    const rankA = parseInt(a.ranking, 10);
    const rankB = parseInt(b.ranking, 10);
    const hasRankA = !isNaN(rankA) && rankA > 0;
    const hasRankB = !isNaN(rankB) && rankB > 0;

    if (hasRankA && hasRankB) return rankA - rankB;
    if (hasRankA) return -1;
    if (hasRankB) return 1;

    return 0;
  });

  return scoredColleges;
};

// Backward compatibility export
export const predictCollegesUsingAI = async (filters) => {
  try {
    const colleges = await predictCollegesService(filters);
    return colleges.map(c => c.name);
  } catch (error) {
    console.error("Predictor Error:", error.message);
    return [];
  }
};
