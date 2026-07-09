import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { SchoolAttendance } from './models/schoolAttendance.js';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/KOGI_AGILE_DB_TEST')
  .then(async () => {
    const records = await SchoolAttendance.find({ schoolId: new mongoose.Types.ObjectId('676f4cb12b490484a5fa4172') })
       .sort({ date: -1 })
       .limit(5)
       .select('date')
       .lean();
    console.log('Recent dates for this school:', records.map(r => r.date));
    mongoose.disconnect();
  });
