import mongoose from 'mongoose';

const AcademicsSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'college',
    required: true,
    unique: true
  },
  averageClass10Result: { type: String, default: '' },
  averageClass12Result: { type: String, default: '' },
  averagecollegeMarks: { type: String, default: '75' },
  specialExamsTraining: { type: [String], default: [] },
  extraCurricularActivities: { type: [String], default: [] }
}, { timestamps: true });

const Academics = mongoose.model('academics', AcademicsSchema, 'college_academics');
export default Academics;
