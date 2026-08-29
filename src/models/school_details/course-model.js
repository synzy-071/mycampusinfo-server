// models/course-model.js
import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "college",
      required: true,
    },

    courseName: { type: String, required: true },
    duration: { type: String },
    intake: { type: Number },
    category: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
