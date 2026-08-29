// models/course_placement_model.js
import mongoose from "mongoose";

const CoursePlacementSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    year: { type: Number, required: true },

    totalStudents: { type: Number, required: true },
    placedStudents: { type: Number, required: true },

    minPackage: { type: Number, required: true },
    maxPackage: { type: Number, required: true },
    averagePackage: { type: Number },

    companies: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.CoursePlacement ||
  mongoose.model("CoursePlacement", CoursePlacementSchema);
