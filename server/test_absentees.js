import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { SchoolAttendance } from './models/schoolAttendance.js';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const attendances = await SchoolAttendance.find({ 'absentees.0': { $exists: true } }).limit(2).lean();
  console.log('Sample attendances with absentees:', JSON.stringify(attendances, null, 2));
  process.exit();
});
