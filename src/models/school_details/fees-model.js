// models/course_fee_model.js
import mongoose from "mongoose";

const CourseFeeSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true, 
    },

    tuition: { type: Number, required: true, min: 0 },
    activity: { type: Number, default: 0, min: 0 },
    transport: { type: Number, default: 0, min: 0 },
    hostel: { type: Number, default: 0, min: 0 },
    misc: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.CourseFee ||
  mongoose.model("CourseFee", CourseFeeSchema);
