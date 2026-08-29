import mongoose from 'mongoose';

// Sub-schema for Exchange Programs
const ExchangeProgramSchema = new mongoose.Schema({
  partnerSchool: {
    type: String,
   
    trim: true
  },
  programType: {
    type: String,
    enum: ['Student Exchange', 'Faculty Exchange', 'Summer Program', 'Joint Research', 'Cultural Exchange']
  },
  duration: {
    type: String,   enum: ['2 Weeks', '1 Month', '3 Months', '6 Months', '1 Year']
  },
  studentsParticipated: {
    type: Number,
    min: 0
  },
  activeSince: {
    type: Number,
  }
});

// Sub-schema for Global Tie-ups
const GlobalTieUpSchema = new mongoose.Schema({
  partnerName: {
    type: String,

    trim: true
  },
  natureOfTieUp: {
    type: String,

    enum: ['Memorandum of Understanding (MoU)', 'Research Collaboration', 'Curriculum Development', 'Faculty Training']
  },
  activeSince: {
    type: Number,

  },
  description: {
    type: String,
  
    trim: true
  }
});

// Main Schema
const InternationalExposureSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "college",
    required: true,
    unique: true
  },
  exchangePrograms: [ExchangeProgramSchema],
  globalTieUps: [GlobalTieUpSchema]
}, { timestamps: true });

const InternationalExposure = mongoose.model('internationalExposure', InternationalExposureSchema, 'college_internationalExposure');

export default InternationalExposure;