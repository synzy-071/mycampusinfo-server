import mongoose from 'mongoose';

const StudentApplicationSchema = new mongoose.Schema({

  studId: { type: mongoose.Schema.Types.ObjectId, ref: 'students', required: true },

  name: { type: String, required: true },
  location: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  motherTongue: { type: String, required: true },
  placeOfBirth: { type: String, default: null },
  speciallyAbled: { type: Boolean, default: false },
  nationality: { type: String, required: true },
category :{type:String,required :true},
  // Parent Details
  fatherName: { type: String, required: false },
  fatherAge: { type: Number, required: false },
  fatherQualification: { type: String, required: false },
  fatherProfession: { type: String, required: false },
  fatherAnnualIncome: { type: String, required: false },
  fatherPhoneNo: { type: String, required:  false },
  fatherEmail: { type: String, required: false },

  motherName: { type: String, required: false },
  motherAge: { type: Number, required: false },
  motherQualification: { type: String, required: false },
  motherProfession: { type: String, required: false },
  motherAnnualIncome: { type: String, required: false },
  motherPhoneNo: { type: String, required: false },
  motherEmail: { type: String, required: false },

  yearlyBudget: { type: String, required: false },

  // 🎓 Course Preferences (STRING only)
  coursePreferences: [
    {
      priority: { type: Number, enum: [1, 2, 3], required: true },
      courseName: { type: String, required: true }
    }
  ],

  // 🎓 Latest Qualification
  latestQualification: {
    level: {
      type: String,
      enum: ['10th', '12th', 'Diploma', 'UG', 'PG'],
      required: true
    },

  },

  // 📚 Academic Details
  academicDetails: {
    stream: {
      type: String,
      enum: ['PCM', 'PCB', 'PCMB', 'Arts', 'Commerce', 'Other'],
      required: true
    },
    subjects: [
      {
        subjectName: { type: String, required: true },
        marksObtained: { type: Number, required: true },
        maxMarks: { type: Number, required: true }
      }
    ],
    overallPercentage: { type: Number }
  }

}, { timestamps: true });


StudentApplicationSchema.pre('save', function (next) {
  if (this.dob) {
    const today = new Date();
    let age = today.getFullYear() - this.dob.getFullYear();
    const m = today.getMonth() - this.dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < this.dob.getDate())) {
      age--;
    }
    this.age = age;
  }
  next();
});


const StudentApplication = mongoose.model("StudentApplication", StudentApplicationSchema);
export default StudentApplication;