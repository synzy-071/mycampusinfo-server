import mongoose from 'mongoose';

const TimelineEntrySchema = new mongoose.Schema({
    admissionStartDate: {
        type: Date,
        required: true
    },
    admissionEndDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Ongoing', 'Ended', 'Starting Soon'],
        required: true
    },
    applicationFee: {
        type: Number,
        required: true
    },
      courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course', // must match Course model name
            required: true,
            description: "The course for which this admission timeline applies."
        },
    documentsRequired: {
        type: [String],
        default: []
    },
    eligibility: {
        minQualification: {
            type: String,
            trim: true
        },
        otherInfo: {
            type: String,
            trim: true,
            description: "Any other eligibility information."
        }
    }
});

// This main schema links the list of timelines to a single school
const AdmissionTimelineSchema = new mongoose.Schema(
    {
        collegeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'college',
            required: true,
          
        },
        // The main field is now an array of the sub-schema defined above
        timelines: [TimelineEntrySchema]
    },
    { timestamps: true }
);

const AdmissionTimeline =
    mongoose.models.AdmissionTimeline ||
    mongoose.model('AdmissionTimeline', AdmissionTimelineSchema, 'college_admission_timeline');

export default AdmissionTimeline;
