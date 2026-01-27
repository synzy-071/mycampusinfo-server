import mongoose from 'mongoose';

const InfrastructureSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "college",
    required: true,
    unique: true
  },
  labs: {
    type: [String],
    enum: [
      "Computer Lab",
      "Science Lab",
      "Research Lab",
      "Language Lab",
      "Innovation Lab",
      "Skill Development Lab",
      "Simulation Lab",
      "Digital Lab",
      "Analytics Lab",
      "Practical Training Lab",
      "Workshop",
      "Multimedia Lab"
    ]

  },
  sportsGrounds: {
    type: [String],
    enum: ['Football', 'Cricket', 'Basketball', 'Tennis', 'Athletics', 'Badminton']
  },
  libraryBooks: {
    type: Number,
    min: [0, 'Number of books cannot be negative.']
  },
  smartClassroomsPercentage: {
    type: Number,

    min: 0,
    max: 100
  },
  eLearningPlatforms: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const Infrastructure = mongoose.model('infrastructure', InfrastructureSchema);

export default Infrastructure;