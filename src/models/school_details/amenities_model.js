import mongoose from 'mongoose';

const AmenitiesSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "college",
    required: true,
    unique: true
  },
  predefinedAmenities: {
    type: [String],
    default: []
  },
  customAmenities: {
    type: [String],
    required: false
  }
}, { timestamps: true });

const Amenities = mongoose.model('amenities', AmenitiesSchema, 'college_amenities');
export default Amenities;
