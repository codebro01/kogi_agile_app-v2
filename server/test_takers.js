import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const AttendanceTakerSchema = new mongoose.Schema({
    email: String,
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roles' }],
    permissions: []
}, { strict: false, collection: 'attendancetakers' }); // Model name must be lowercase plural or exact collection name
const AttendanceTaker = mongoose.model('AttendanceTakerTest', AttendanceTakerSchema);

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');
    
    const takers = await AttendanceTaker.find({}).limit(5);
    console.log("Found AttendanceTakers:", takers.length);
    takers.forEach(t => {
        console.log(`Taker ${t.email}:`);
        console.log(`  Roles:`, t.roles);
        console.log(`  Permissions (direct):`, t.permissions);
    });

    mongoose.disconnect();
}

run().catch(console.error);
