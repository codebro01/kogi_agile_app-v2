import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { SchoolAttendance } from './models/schoolAttendance.js';
import { StudentStatusEvent } from './models/studentStatusEventSchema.js';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/KOGI_AGILE_DB_TEST')
  .then(async () => {
    // Manually run what the controller does
    const fromDate = '2026-06-01';
    const toDate = '2026-06-05';
    
    const attendanceMatchQuery = {
       schoolId: new mongoose.Types.ObjectId('676f4cb12b490484a5fa4172')
    };

    if (fromDate || toDate) {
      attendanceMatchQuery.date = {};
      if (fromDate) attendanceMatchQuery.date['$gte'] = new Date(fromDate);
      if (toDate) attendanceMatchQuery.date['$lte'] = new Date(new Date(toDate).setHours(23, 59, 59, 999));
    }
    
    const records = await SchoolAttendance.find(attendanceMatchQuery).select('date totalEnrolled absentees.studentId attendanceTaken').lean();
    console.log('June 1 to 5 found:', records.length);
    
    const fromDate2 = '2026-07-01';
    const toDate2 = '2026-07-08';
    const attendanceMatchQuery2 = {
       schoolId: new mongoose.Types.ObjectId('676f4cb12b490484a5fa4172')
    };
    attendanceMatchQuery2.date = {};
    attendanceMatchQuery2.date['$gte'] = new Date(fromDate2);
    attendanceMatchQuery2.date['$lte'] = new Date(new Date(toDate2).setHours(23, 59, 59, 999));
    const records2 = await SchoolAttendance.find(attendanceMatchQuery2).select('date').lean();
    console.log('July 1 to 8 found:', records2.length);

    mongoose.disconnect();
  });
