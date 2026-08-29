import mongoose from 'mongoose';

const SafetyAndSecuritySchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "college",
    required: true,
    unique: true
  },
  cctvCoveragePercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  medicalFacility: {
    doctorAvailability: {
      type: String,
   
      enum: ['Full-time', 'Part-time', 'On-call', 'Not Available']
    },
    medkitAvailable: {
      type: Boolean,
   
      default: false
    },
    ambulanceAvailable: {
      type: Boolean,
     
      default: false
    }
  },
  transportSafety: {
    gpsTrackerAvailable: {
      type: Boolean,

      default: false
    },
    driversVerified: {
      type: Boolean,
     
      default: false
    }
  },

  fireSafetyMeasures: {
    type: [String],
    enum: ['Extinguishers', 'Alarms', 'Sprinklers', 'Evacuation Drills']
  },
  visitorManagementSystem: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const SafetyAndSecurity = mongoose.model('safetyAndSecurity', SafetyAndSecuritySchema, 'college_safetyAndSecurity');

export default SafetyAndSecurity;