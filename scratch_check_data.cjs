const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://synzy2025_db_user:aYBkg3UdKuD0DiZW@synzycollegeapp.eq7rabv.mongodb.net/myc-stage').then(async () => {
  const collections = ['college_amenities', 'college_activities', 'college_faculty', 'college_infrastructure', 'college_internationalExposure', 'college_safetyAndSecurity', 'college_admission_timeline', 'college_otherDetails', 'college_reviews', 'college_alumnis', 'courses', 'coursefees', 'hostels', 'scholarships', 'courseexams', 'courseplacements'];
  for (const c of collections) {
     try {
       const docs = await mongoose.connection.collection(c).find({ collegeId: { $exists: true } }).limit(1).toArray();
       if (docs.length > 0) {
          console.log('Collection', c, 'has college data! Sample collegeId:', docs[0].collegeId);
       }
     } catch (e) {}
  }
  process.exit(0);
});
