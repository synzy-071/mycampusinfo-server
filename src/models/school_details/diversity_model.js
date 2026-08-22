import mongoose from 'mongoose';

const OtherDetailsSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "college",
    required: true,
    unique: true
  },
  genderRatio: {
    male: { type: Number, required: true, min: 0, max: 100 },
    female: { type: Number, required: true, min: 0, max: 100 },
    others: { type: Number, required: true, min: 0, max: 100 }
  },
  scholarshipDiversity: {
    types: {
      type: [String],
      enum: ['Merit', 'Socio-economic', 'Cultural', 'Sports', 'Community', 'Academic Excellence']
    },
    studentsCoveredPercentage: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  specialNeedsSupport: {
    dedicatedStaff: {
      type: Boolean,
      default: false
    },
    studentsSupportedPercentage: {
      type: Number,
      min: 0,
      max: 100
    },
    facilitiesAvailable: {
      type: [String],
      enum: ['Ramps', 'Wheelchair access', 'Special educators', 'Learning support', 'Resource room', 'Assistive devices']
    }
  }
}, { timestamps: true });

const OtherDetails = mongoose.model('otherDetails', OtherDetailsSchema, 'college_otherDetails');

export default OtherDetails;