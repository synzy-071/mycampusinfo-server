import mongoose from "mongoose";

const CollegeSchema = new mongoose.Schema({
    authId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auths',
        required: true
    },
    name: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    ranking: { type: String },
    estYear: { type: String, required: true },
    lat: { type: Number, required: true },
    long: { type: Number, required: true },
    area: {
        type: String,
        required: false
    },
    acceptanceRate: { type: String, required: true },
    collegeInfo: { type: String, required: true },
    address: { type: String, required: false },
    pinCode: { type: Number, required: false },
    collegeMode: { type: String, required: true, enum: ['convent', 'private', 'government'] },
    genderType: { type: String, required: true, enum: ['boy', 'girl', 'co-ed'] },
    shifts: { type: [String], required: true, enum: ['morning', 'afternoon', 'night college', 'online'] },
    feeRange: {
        type: String, required: true, enum: [
            "1000 - 10000",
            "10000 - 25000",
            "25000 - 50000",
            "50000 - 75000",
            "75000 - 100000",
            "1 Lakh - 2 Lakh",
            "2 Lakh - 3 Lakh",
            "3 Lakh - 4 Lakh",
            "4 Lakh - 5 Lakh",
            "More than 5 Lakh"
        ]
    },
    stream: {
        type: String,
        required: true,
        enum: ['Engineering', 'Management', 'Arts', 'Science', 'Law', 'Medical', 'Design', 'Humanities'] 
    },
    email: { type: String, required: true },
    mobileNo: { type: String, required: true },
    specialist: { type: [String], required: false },
    tags: { type: [String], required: false },
    website: { type: String, required: false },
    status: { type: String, required: true, enum: ['pending', 'rejected', 'accepted'], default: "pending" },
    languageMedium: { type: [String], required: true },
    transportAvailable: { type: String, required: false, enum: ['yes', 'no'] },
    TeacherToStudentRatio: { type: String, required: false },
    score: { type: Number, required: false, default: 0 },
    instagramHandle: { type: String, required: false },
    twitterHandle: { type: String, required: false },
    linkedinHandle: { type: String, required: false },
    photos: [{
        url: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    videos: {
        url: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now }
    },

    logo: {
        url: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now }
    },
});

const College = mongoose.model("college", CollegeSchema);
export default College;