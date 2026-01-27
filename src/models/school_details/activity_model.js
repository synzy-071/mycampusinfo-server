import mongoose from 'mongoose';

const ActivitiesSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "college",
    required: true,
    unique: true
  },
  activities: [{
    type: String,
    enum: [
      'Focusing on Academics',
      'Focuses on Practical Learning',
      'Focuses on Theoretical Learning',
      'Empowering in Sports',
      'Empowering in Arts',
      'Special Focus on Mathematics',
      'Special Focus on Science',
      'Special Focus on Physical Education',
      'Leadership Development',
      'STEM Activities',
      'Cultural Education',
      'Technology Integration',
      'Environmental Awareness',
      'Startup Incubation',
      'Robotics Club'
    ]
  }]
}, { timestamps: true });

const Activities = mongoose.model('activities', ActivitiesSchema);
export default Activities;
