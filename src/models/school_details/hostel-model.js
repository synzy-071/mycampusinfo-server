import mongoose from "mongoose";

const HostelSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },

    hostelName: {
      type: String,
      trim: true,
      required: true,
    },

    type: {
      type: String,
      enum: ["Boys", "Girls", "Co-Ed"],
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
    },

    availableSeats: {
      type: Number,
      required: true,
    },

    feePerYear: {
      type: Number,
      required: true,
    },

    facilities: {
      type: [String], // WiFi, Mess, Laundry, Gym, etc.
      default: [],
    },

    rules: {
      type: String,
      trim: true,
    },

    contactPerson: {
      name: String,
      phone: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Hostel", HostelSchema);
