import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "college",
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500
  },
  ratings: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
  student: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "students",
    default: []
  }],
  // --- NEW FIELD ADDED ---
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

export default mongoose.model('reviews', reviewSchema, 'college_reviews');