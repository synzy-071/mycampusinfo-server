import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update path to look for .env in the parent directory (mycampusinfo-server root)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const url = process.env.MONGODB_URL;
if (!url) {
  console.log('No MONGODB_URL found in .env');
  process.exit(1);
}

const collections = [
  'activities',
  'AdmissionTimeline',
  'alumnis',
  'amenities',
  'otherDetails',
  'faculty',
  'infrastructure',
  'internationalExposure',
  'reviews',
  'safetyAndSecurity'
];

async function run() {
  try {
    await mongoose.connect(url, { dbName: process.env.DB_NAME || 'myc-stage' });
    console.log('Connected to MongoDB');
    
    const results = {};
    for (const colName of collections) {
      const db = mongoose.connection.db;
      const col = db.collection(colName);
      
      const total = await col.countDocuments();
      const withSchoolId = await col.countDocuments({ schoolId: { $exists: true, $ne: null } });
      const withCollegeId = await col.countDocuments({ collegeId: { $exists: true, $ne: null } });
      const withNeither = await col.countDocuments({ 
        schoolId: { $in: [null, undefined] }, 
        collegeId: { $in: [null, undefined] } 
      });
      
      const collegeDocs = await col.find({ collegeId: { $exists: true, $ne: null } }).toArray();
      const collegeIds = collegeDocs.map(d => d.collegeId.toString());
      
      results[colName] = {
        total,
        withSchoolId,
        withCollegeId,
        withNeither,
        uniqueCollegeIds: [...new Set(collegeIds)]
      };
    }
    console.log(JSON.stringify(results, null, 2));
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

run();
