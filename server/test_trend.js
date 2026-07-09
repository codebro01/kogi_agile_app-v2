import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { SchoolAttendance } from './models/schoolAttendance.js';
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/KOGI_AGILE_DB_TEST').then(async () => {
  const m = 5; // June
  const y = 2026;
  const startOfMonth = new Date(Date.UTC(y, m, 1));
  const endOfMonth = new Date(Date.UTC(y, m + 1, 1));
  const matchQuery = {
    date: { $gte: startOfMonth, $lt: endOfMonth },
    schoolId: '676f4cb12b490484a5fa4172' // Army Day Secondary School
  };
  const attendanceRecords = await SchoolAttendance.find(matchQuery).lean();
  console.log('Records for June:', attendanceRecords.length);

  const trend = {};
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(Date.UTC(y, m, i));
    const isSchoolDay = d.getUTCDay() !== 0 && d.getUTCDay() !== 6;
    if (isSchoolDay) trend[i] = { present: 0, absent: 0, total: 0 };
  }
  
  attendanceRecords.forEach(record => {
    const day = new Date(record.date).getUTCDate();
    if (trend[day] && record.attendanceTaken) {
      const enrolled = record.totalEnrolled || 0;
      const absentCount = (record.absentees || []).length;
      const presentCount = Math.max(0, enrolled - absentCount);

      trend[day].present += presentCount;
      trend[day].absent += absentCount;
      trend[day].total += enrolled;
    }
  });

  console.log('Trend data for June:', JSON.stringify(trend, null, 2).slice(0, 500) + '...');
  mongoose.disconnect();
});
