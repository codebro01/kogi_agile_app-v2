import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (let c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`${c.name}: ${count}`);
  }
  
  const attendancesSample = await mongoose.connection.db.collection('newattendances').find().sort({_id:-1}).limit(5).toArray();
  console.log("newattendances sample:", JSON.stringify(attendancesSample, null, 2));

  mongoose.disconnect();
}
run().catch(console.error);
