import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const StudentSchema = new mongoose.Schema({}, { strict: false });
const Student = mongoose.model('Students', StudentSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const verifiedAndInactive = await Student.countDocuments({ verificationStatus: true, isActive: false });
  const verifiedAndNull = await Student.countDocuments({ verificationStatus: true, isActive: null });
  const verifiedAndMissing = await Student.countDocuments({ verificationStatus: true, isActive: { $exists: false } });
  
  console.log('Verified & isActive=false:', verifiedAndInactive);
  console.log('Verified & isActive=null:', verifiedAndNull);
  console.log('Verified & isActive missing:', verifiedAndMissing);
  
  process.exit(0);
}
run();
