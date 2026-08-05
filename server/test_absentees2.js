import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { SchoolAttendance } from './models/schoolAttendance.js';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const att = await SchoolAttendance.findOne({ 'absentees.0': { $exists: true } }).lean();
  if (att) {
    console.log('Type of absentees:', typeof att.absentees);
    console.log('Is Array?', Array.isArray(att.absentees));
    console.log('First absentee:', att.absentees[0]);
    console.log('First absentee typeof:', typeof att.absentees[0]);
    if (att.absentees[0].studentId) {
      console.log('Has studentId:', att.absentees[0].studentId);
    }
  } else {
    console.log('No absentees found');
  }
  process.exit();
});
