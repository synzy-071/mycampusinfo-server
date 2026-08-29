import mongoose from 'mongoose';

const TechnologyAdoptionSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'college',
    required: true,
    unique: true
  },
  smartClassroomsPercentage: { type: Number, default: 0 },
  eLearningPlatforms: { type: [String], default: [] }
}, { timestamps: true });

const TechnologyAdoption = mongoose.model('technologyAdoption', TechnologyAdoptionSchema, 'college_technology_adoption');
export default TechnologyAdoption;
