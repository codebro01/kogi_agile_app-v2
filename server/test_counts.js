import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { SchoolAttendance } from './models/schoolAttendance.js';
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/KOGI_AGILE_DB_TEST').then(async () => {
  const june = await SchoolAttendance.countDocuments({ date: { $gte: new Date('2026-06-01'), $lt: new Date('2026-07-01') } });
  const july = await SchoolAttendance.countDocuments({ date: { $gte: new Date('2026-07-01'), $lt: new Date('2026-08-01') } });
  console.log('June count:', june);
  console.log('July count:', july);
  mongoose.disconnect();
});
