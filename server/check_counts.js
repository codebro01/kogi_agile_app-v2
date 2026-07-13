import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kogi_agile', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const db = mongoose.connection.db;
    const studentCount = await db.collection('students').countDocuments({ isActive: { $ne: false } });
    
    const totalEnrolled = await db.collection('schoolattendances').aggregate([
      { $sort: { date: -1 } },
      { $group: { _id: '$schoolId', totalEnrolled: { $first: '$totalEnrolled' } } },
      { $group: { _id: null, total: { $sum: '$totalEnrolled' } } }
    ]).toArray();
    
    console.log('Student count:', studentCount);
    console.log('Total Enrolled aggregate:', JSON.stringify(totalEnrolled));
    process.exit(0);
  })
  .catch(console.error);
