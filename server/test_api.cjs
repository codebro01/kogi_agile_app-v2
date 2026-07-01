const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Student, NewAttendance } = require('./models/index.js');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const query = { schoolId: '676f4cb12b490484a5fa4172', cohort: '', fromDate: '', toDate: '', term: '', session: '' };
    const { schoolId, cohort, fromDate, toDate, term, session, presentClass } = query;
    
    const studentMatch = {};
    if (schoolId && schoolId !== 'all') studentMatch.schoolId = schoolId;
    if (cohort) studentMatch.cohort = Number(cohort);
    if (presentClass) studentMatch.presentClass = presentClass;

    console.log("studentMatch:", studentMatch);
    
    const students = await Student.find(studentMatch).select('_id');
    const studentIds = students.map(s => s._id);
    console.log("Students found:", studentIds.length);

    const attendanceMatch = { studentId: { $in: studentIds } };
    if (fromDate || toDate) {
      attendanceMatch.date = {};
      if (fromDate) attendanceMatch.date.$gte = new Date(fromDate);
      if (toDate) attendanceMatch.date.$lte = new Date(toDate);
    }
    if (term) attendanceMatch.term = term;
    if (session) attendanceMatch.session = session;

    console.log("attendanceMatch:", attendanceMatch);

    const attendanceRecords = await NewAttendance.find(attendanceMatch);
    console.log("Attendance records found:", attendanceRecords.length);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
});
