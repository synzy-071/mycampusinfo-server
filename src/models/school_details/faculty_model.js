import mongoose from 'mongoose';


const FacultyMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  qualification: {
    type: String,
    required: true,
    trim: true
  },
  awards: {
    type: [String], 
    default: []
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
    description: "Teaching experience in years"
  }
});


const FacultySchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "college",
    required: true,
    unique: true
  },
  facultyMembers: [FacultyMemberSchema]
}, { timestamps: true });

const Faculty = mongoose.model('faculty', FacultySchema, 'college_faculty');

export default Faculty;