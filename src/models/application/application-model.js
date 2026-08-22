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
  religion: { type: String, required: false },
  category: { type: String, required: true },
  caste: { type: String, required: false },
  subcaste: { type: String, required: false },
  aadharNo: { type: String, required: false },
  bloodGroup: { type: String, required: false },
  allergicTo: { type: String, required: false },
  interest: { type: String, required: false },
  speciallyAbledType: { type: String, required: false },
  age: { type: Number, required: false },

  // College & Application Information
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'college', required: false },
  collegeName: { type: String, required: false },
  collegeEmail: { type: String, required: false },

  // Address Details
  presentAddress: { type: String, required: false },
  permanentAddress: { type: String, required: false },
  homeLanguage: { type: String, required: false },

  // Parent Details
  fatherName: { type: String, required: false },
  fatherAge: { type: Number, required: false },
  fatherQualification: { type: String, required: false },
  fatherProfession: { type: String, required: false },
  fatherAnnualIncome: { type: String, required: false },
  fatherPhoneNo: { type: String, required:  false },
  fatherAadharNo: { type: String, required: false },
  fatherEmail: { type: String, required: false },

  motherName: { type: String, required: false },
  motherAge: { type: Number, required: false },
  motherQualification: { type: String, required: false },
  motherProfession: { type: String, required: false },
  motherAnnualIncome: { type: String, required: false },
  motherPhoneNo: { type: String, required: false },
  motherAadharNo: { type: String, required: false },
  motherEmail: { type: String, required: false },

  // Guardian Details
  guardianName: { type: String, required: false },
  guardianAge: { type: Number, required: false },
  guardianContactNo: { type: String, required: false },
  guardianRelationToStudent: { type: String, required: false },
  guardianQualification: { type: String, required: false },
  guardianProfession: { type: String, required: false },
  guardianEmail: { type: String, required: false },
  guardianAadharNo: { type: String, required: false },
  guardianAnnualIncome: { type: String, required: false },

  yearlyBudget: { type: String, required: false },
  relationshipStatus: { type: String, required: false },
  siblings: [
    {
      name: { type: String },
      age: { type: Number },
      sex: { type: String },
      nameOfInstitute: { type: String },
      className: { type: String }
    }
  ],

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
      required: true
    },
  },
  
  // 🎓 Current Grade / Qualification
  currentGrade: {
    type: String,
    required: false
  },

  board: { type: String, required: false },
  lastcollegeName: { type: String, required: false },
  classCompleted: { type: String, required: false },
  lastAcademicYear: { type: String, required: false },
  reasonForLeaving: { type: String, required: false },

  // 📚 Academic Details
  academicDetails: {
    stream: {
      type: String,
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