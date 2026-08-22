import mongoose from "mongoose";

const AlumniSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "college", 
      required: true
    },
    topAlumnis: [
      {
        name: {
          type: String,
          required: true
        },
        percentage: {
          type: Number,
          required: true
        }
      }
    ],
    famousAlumnies: [
      {
        name: {
          type: String,
          required: true
        },
        profession: {
          type: String,
          required: true
        }
      }
    ],
    alumnis: [
      {
        name: {
          type: String,
          required: true
        },
        percentage: {
          type: Number,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Alumni = mongoose.model('alumnis', AlumniSchema, 'college_alumnis');
export default Alumni;
