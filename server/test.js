import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const StudentSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'AllSchools' },
    accountNumber: String,
    surname: String,
    firstname: String,
    middlename: String,
    isActive: Boolean
}, { strict: false, collection: 'students' });
const Student = mongoose.model('StudentTest', StudentSchema);

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');
    
    const students = await Student.find({}).limit(10);
    const schoolIdStr = students[0]?.schoolId?.toString();
    console.log("Using schoolId:", schoolIdStr);

    if(schoolIdStr) {
        const query = { 
            schoolId: new mongoose.Types.ObjectId(schoolIdStr), 
            accountNumber: { $exists: true, $ne: '' } 
        };
        const matching = await Student.find(query).select('_id surname firstname middlename accountNumber isActive');
        console.log(`Matching for school ${schoolIdStr}:`, matching.length);

        if (matching.length > 0) {
            console.log("First match:", matching[0]);
        }
        
        const q2 = { schoolId: new mongoose.Types.ObjectId(schoolIdStr) };
        const allInSchool = await Student.find(q2).select('_id accountNumber');
        console.log(`Total in school ${schoolIdStr}:`, allInSchool.length);
        console.log("Account numbers in this school:", allInSchool.map(s => s.accountNumber).slice(0, 10));
    }
    
    mongoose.disconnect();
}

run().catch(console.error);
