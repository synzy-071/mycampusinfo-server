import Review from '../models/school_details/review_model.js';
import Amenities from '../models/school_details/amenities_model.js';
// import { getSchoolScoreById } from '../controllers/school-controllers.js';

export const toCollegeCardModel = (college, ratings = 0, amenities = [], userLocation = null) => {
    const lat = typeof college.lat === 'number' ? college.lat : (typeof college.latitude === 'number' ? college.latitude : null);
    const long = typeof college.long === 'number' ? college.long : (typeof college.longitude === 'number' ? college.longitude : null);

    let distance = null;
    let distanceValue = null;
    if (userLocation && userLocation.latitude && userLocation.longitude && lat !== null && long !== null) {
        const R = 6371; // km
        const dLat = (lat - userLocation.latitude) * Math.PI / 180;
        const dLon = (long - userLocation.longitude) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceValue = R * c;
        if (distanceValue < 1) {
            distance = `${Math.round(distanceValue * 1000)}m`;
        } else if (distanceValue < 10) {
            distance = `${distanceValue.toFixed(1)} Km`;
        } else {
            distance = `${Math.round(distanceValue)} Km`;
        }
    }

    const rawCover = college.logo ?? (college.photos?.length > 0 ? college.photos[0] : null);
    const logoObj = college.logo || (college.photos?.length > 0 ? college.photos[0] : null);

    const stream = college.stream || (Array.isArray(college.streamsOffered) && college.streamsOffered[0]) || '';
    const streamsOffered = Array.isArray(college.streamsOffered) ? college.streamsOffered : (stream ? [stream] : []);

    const scoreNum = typeof college.score === 'number' ? college.score : 0;
    const scoreDisplay = college.scoreDisplay || (scoreNum > 0 ? `${scoreNum}/100` : (ratings > 0 ? `${ratings}/5` : 'N/A'));
    const board = college.board || '';
    const collegeType = college.collegeType || stream;

    return {
        _id: college._id,
        id: college._id,
        collegeId: college._id,
        name: college.name,
        collegeName: college.name,
        feeRange: college.feeRange || 'Contact college',
        city: college.city || '',
        state: college.state || '',
        location: college.city && college.state ? `${college.city}, ${college.state}` : (college.city || college.state || 'India'),
        board: board,
        genderType: college.genderType || 'co-ed',
        shifts: college.shifts || [],
        collegeMode: college.collegeMode || 'private',
        type: stream,
        stream: stream,
        streamsOffered: streamsOffered,
        ranking: college.ranking || '',
        acceptanceRate: college.acceptanceRate || '',
        collegeInfo: college.collegeInfo || '',
        description: college.collegeInfo || `${college.name} is a premier institution for higher education.`,
        score: scoreNum,
        scoreDisplay: scoreDisplay,
        scoreColorClass: college.scoreColorClass || 'text-gray-800',
        latitude: lat,
        longitude: long,
        lat: lat,
        long: long,
        logo: logoObj,
        coverImage: rawCover,
        photos: college.photos || [],
        amenities,
        facilities: amenities,
        ratings,
        rating: ratings,
        website: college.website || '#',
        email: college.email || '',
        mobileNo: college.mobileNo || '',
        phone: college.mobileNo || 'Contact college',
        distance,
        distanceValue,
        matchScore: college.matchScore || null,
        acceptedExam: college.acceptedExam || '',
        cutoff: college.cutoff || '',
        admissionChance: college.admissionChance || ''
    };
};

export const toCollegeCardModels = async (colleges = [], userLocation = null) => {
    const mapped = await Promise.all(
        colleges.map(async (college) => {
            const review = await Review.findOne({ collegeId: college._id });
            const amenities = await Amenities.findOne({ collegeId: college._id });
            return toCollegeCardModel(
                college, 
                review?.ratings || 0, 
                amenities?.predefinedAmenities || amenities?.customAmenities || [],
                userLocation
            );
        })
    );
    return mapped;
};
