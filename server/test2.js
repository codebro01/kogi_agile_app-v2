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
const Student = mongoose.model('StudentTest2', StudentSchema);

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find a school that has students
    const studentWithSchool = await Student.findOne({ schoolId: { $ne: null } });
    if (!studentWithSchool) {
        console.log("No students with schoolId found.");
        return;
    }
    const schoolIdStr = studentWithSchool.schoolId.toString();
    console.log("Using schoolId:", schoolIdStr);

    const students = await Student.find({ 
      schoolId: schoolIdStr, 
      accountNumber: { $exists: true, $ne: '' } 
    }).sort({ surname: 1 }).select('_id surname firstname middlename accountNumber isActive');

    console.log(`Query returned ${students.length} students for schoolId string`);
    
    const studentsObjId = await Student.find({ 
      schoolId: new mongoose.Types.ObjectId(schoolIdStr), 
      accountNumber: { $exists: true, $ne: '' } 
    }).sort({ surname: 1 }).select('_id surname firstname middlename accountNumber isActive');

    console.log(`Query returned ${studentsObjId.length} students for schoolId ObjectId`);

    // Let's also test what happens if we use $nin: [null, '', ' ']
    const studentsValidAcct = await Student.find({
        schoolId: schoolIdStr,
        accountNumber: { $nin: [null, '', ' '] }
    });
    console.log(`Query with $nin null returned ${studentsValidAcct.length} students`);

    mongoose.disconnect();
}

run().catch(console.error);
