import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { SchoolAttendance } from './models/schoolAttendance.js';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/KOGI_AGILE_DB_TEST')
  .then(async () => {
    const fromDate = '2026-06-08';
    const toDate = '2026-06-08';
    const attendanceMatchQuery = {
       schoolId: new mongoose.Types.ObjectId('676f4cb12b490484a5fa4172')
    };

    if (fromDate || toDate) {
      attendanceMatchQuery.date = {};
      if (fromDate) attendanceMatchQuery.date['$gte'] = new Date(fromDate);
      if (toDate) attendanceMatchQuery.date['$lte'] = new Date(new Date(toDate).setHours(23, 59, 59, 999));
    }
    
    console.log('Query:', attendanceMatchQuery);
    const explain = await SchoolAttendance.find(attendanceMatchQuery).explain();
    console.log('Docs examined:', explain.executionStats.totalDocsExamined, 'Returned:', explain.executionStats.nReturned);
    console.log('Index used:', explain.executionStats.executionStages.inputStage.indexName);
    mongoose.disconnect();
  });
