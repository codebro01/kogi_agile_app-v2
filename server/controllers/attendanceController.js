import { Student, NewAttendance, AllSchools } from '../models/index.js'
import * as XLSX from 'xlsx'
import express from 'express'
import fs from 'fs'
import path from 'path'

// ✅ Create NewAttendance
// export const createAttendance = async (req, res) => {
//   const { studentId, date, present } = req.body

//   try {
//     // Prevent duplicate attendance for the same student + date
//     const existing = await NewAttendance.findOne({ studentId, date })
//     if (existing) {
//       return res
//         .status(400)
//         .json({ message: 'NewAttendance already exists for this date.' })
//     }

//     const attendance = await NewAttendance.create({ studentId, date, present })
//     res.status(201).json(attendance)
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: 'Server error creating attendance.' })
//   }
// }

// // 🔁 Update NewAttendance
// export const updateAttendance = async (req, res) => {
//   const { attendanceId } = req.params
//   const { present } = req.body

//   try {
//     const attendance = await NewAttendance.findByIdAndUpdate(
//       attendanceId,
//       { present },
//       { new: true }
//     )

//     if (!attendance) {
//       return res.status(404).json({ message: 'NewAttendance not found.' })
//     }

//     res.status(200).json(attendance)
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: 'Server error updating attendance.' })
//   }
// }

// export const createOrUpdateAttendance = async (req, res) => {
//   const { studentId, date, present } = req.body

//   // Check if all necessary fields are present
//   if (!studentId || !date || typeof present !== 'boolean') {
//     return res
//       .status(400)
//       .json({ message: 'Missing required fields (studentId, date, present).' })
//   }

//   try {
//     // Update or create attendance for the student on a specific date
//     const updatedAttendance = await NewAttendance.findOneAndUpdate(
//       { studentId, date: new Date(date) }, // search criteria
//       { $set: { present } }, // update action
//       { new: true, upsert: true } // new document if not found
//     )

//     res.status(200).json({
//       message: 'NewAttendance recorded successfully.',
//       attendance: updatedAttendance,
//     })
//   } catch (err) {
//     console.error(err)

//     res.status(500).json({ message: 'Error processing attendance.' })
//   }
// }

export const createOrUpdateAttendance = async (req, res) => {
  // console.log(req.body)
  const { attendanceArray } = req.body

  if (!Array.isArray(attendanceArray) || attendanceArray.length === 0) {
    return res.status(400).json({ message: 'No attendance records provided.' })
  }

  try {
    const bulkOps = attendanceArray
      .filter(
        ({ studentId, status, splittedDate }) =>
          studentId && typeof status === 'number' && splittedDate
      )
      .map(({ studentId, status, splittedDate, absentReason, year, month, term, session }) => ({
        updateOne: {
          filter: { studentId, date: new Date(splittedDate) },
          update: { $set: { status, absentReason, year, month, term, session } },
          upsert: true,
        },
      }))

    const result = await NewAttendance.bulkWrite(bulkOps)

    // Check if any student needs to be marked inactive (died=4, dropout=3, relocated=2)
    const inactiveStatuses = [2, 3, 4]
    const studentsToDeactivate = attendanceArray
      .filter(a => inactiveStatuses.includes(a.status))
      .map(a => a.studentId)

    if (studentsToDeactivate.length > 0) {
      await Student.updateMany(
        { _id: { $in: studentsToDeactivate } },
        { $set: { isActive: false } }
      )
    }

    // Fetch the updated records bsack from DB
    const attendanceDocs = await Promise.all(
      attendanceArray.map(({ studentId, splittedDate }) =>
        NewAttendance.findOne({
          studentId,
          date: new Date(splittedDate),
        })
      )
    )

    res.status(200).json({
      message: 'Attendance records processed successfully using bulkWrite.',
      attendance: attendanceDocs,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to process attendance records.' })
  }
}

// 🔍 Get NewAttendance by Month and School

export const getAttendanceTable = async (req, res, next) => {
  // console.log(req.query)
  // console.log(req.query);
  let {
    schoolId,
    year,
    month,
    page = 1,
    limit = 25,
    presentClass,
    monthlyTotalAttendanceScore,
  } = req.query

  // console.log(req.query)

  limit = Number(limit)
  year = Number(year)
  page = Number(page)
  monthlyTotalAttendanceScore = Number(monthlyTotalAttendanceScore)
  month = Number(month) - 1
  if (!schoolId || !year || month === null) {
    return res.status(400).json({ message: 'Missing schoolId, year, or month' })
  }

  const basket = {}

  if (presentClass) basket.presentClass = presentClass
  if (schoolId && schoolId !== 'all') basket.schoolId = schoolId

  // console.log(basket, schoolId === 'all')
  // console.log(req.query)

  try {
    const skip = (page - 1) * limit

    // 1. Get all students in this school
    const students = await Student.find(basket)
      .collation({ locale: 'en', strength: 1 })
      .sort({ surname: 1 })

    let totalStudents

    if (schoolId === 'all') totalStudents = await Student.countDocuments({})
    else {
      totalStudents = await Student.countDocuments({ schoolId })
    }

    // console.log('students', students)
    // 2. Get all attendance records for those students in that month
    const startOfMonth = new Date(year, month, 1)

    const endOfMonth = new Date(year, month + 1, 1) // 1st of next month
    // next month, same day (i.e. 1st of next month)

    // Then query using date range
    let attendance = await NewAttendance.find({
      studentId: { $in: students.map((s) => s._id) },
      date: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    })

    function getWeekdaysInMonth(year, month) {
      const daysInMonth = new Date(year, month + 1, 0).getDate() // total days in month
      let weekdays = 0

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          weekdays++
        }
      }

      return weekdays
    }

    const daysInWeek = getWeekdaysInMonth(year, month) // e.g. 31
    const daysInMonth = new Date(year, month + 1, 0).getDate() // total days in month

    const filteredStudents = students.filter((student) => {
      const studentAttendance = attendance.filter(
        (a) => a.studentId.toString() === student._id.toString()
      )

      const totalPresent = studentAttendance.filter((a) => a.status === 1).length
      const score = totalPresent * 5
      const percentage = (score / (daysInWeek * 5)) * 100

      return percentage >= monthlyTotalAttendanceScore
    })

    const paginatedStudents = filteredStudents.slice(skip, skip + limit)

    // !!!!!!!!!!!!!!!!!!!!!

    // !!!!!!!!!!!!!!!!!!!!!!!1

    const table = paginatedStudents.reduce((acc, student) => {
      let studentAttendance = attendance.filter(
        (a) => a.studentId.toString() === student._id.toString()
      )

      const totalPresent = studentAttendance.filter((a) => a.status === 1).length
      const attendanceScore = totalPresent * 5

      const passed =
        (attendanceScore / (daysInWeek * 5)) * 100 >=
        monthlyTotalAttendanceScore

      if (!passed) return acc // Skip this student

      const dailyRecords = []

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(Date.UTC(year, month, day))
        const dayOfWeek = dateObj.getUTCDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) continue

        const record = studentAttendance.find((r) => {
          return (
            r.date.getUTCDate() === day &&
            r.date.getUTCMonth() === month &&
            r.date.getUTCFullYear() === year
          )
        })

        dailyRecords.push({
          date: dateObj,
          status: record ? record.status : 0, // default to absent (0) if no record
        })
      }

      const finalStudent = {
        studentId: student._id,
        firstname: student.firstname,
        surname: student.surname,
        middlename: student?.middlename || '',
        attendance: dailyRecords,
      }

      // if (req.query.middlewareOnly === 'true') {
      //   finalStudent.randomId = student.randomId
      //   finalStudent.presentClass = student.presentClass
      // }

      acc.push(finalStudent)
      return acc
    }, [])

    // console.log('Total students found:', students.length)
    // console.log('After filtering by score:', table.length)
// 
    // console.log(table)

    if (req.query.middlewareOnly === 'true') {
      let school
      if (schoolId !== 'all') {
        school = await AllSchools.findOne({ _id: schoolId })
        req.attandanceRecordTable = {
          table,
          school: school.schoolName,
        }
      } else {
        req.attandanceRecordTable = {
          table,
          school: 'All Schools',
        }
      }

      // console.log('middleawate')
      return next()
    }

    // console.log(filteredStudents.length)

    res.status(200).json({
      message: 'NewAttendance table ready',
      table,
      currentPage: Number(page),
      totalPages: Math.ceil(filteredStudents.length / limit),
      totalStudents: filteredStudents.length,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Error building attendance table' })
  }
}

export const downloadAttendanceRecordExcel = async (req, res) => {
  // Simulated attendance data from DB
  // console.log(req.attandanceRecordTable)
  const studentsAttendance = req.attandanceRecordTable.table
  const schoolName = req.attandanceRecordTable.school

  const allDatesSet = new Set()

  studentsAttendance.forEach((student) => {
    student.attendance.forEach((entry) => {
      const dateObj = new Date(entry.date)
      allDatesSet.add(dateObj.toISOString()) // toISOString ensures Set works properly
    })
  })

  // Step 2: Convert to array and sort chronologically
  const sortedDates = Array.from(allDatesSet)
    .map((dateStr) => new Date(dateStr)) // back to Date objects
    .sort((a, b) => a - b) // sort from earliest to latest

  // Step 3: Format to dd/mm/yyyy
  const formattedDates = sortedDates.map(
    (date) => date.toLocaleDateString('en-GB') // '04/07/2025'
  )

  // console.log(allDatesSet)

  const allDates = Array.from(formattedDates).sort()

  // Step 2: Format data for worksheet
  const worksheetData = []

  // Add headers
  const headers = [
    'S/N',
    'Student ID',
    'Name',
    'Present Class',
    ...allDates,
    'P-total',
    'X-total',
  ]

  worksheetData.push([schoolName])
  worksheetData.push(headers)

  // Add rows
  studentsAttendance.forEach((student, index) => {
    // console.log(student)

    const totalPresent = student.attendance.filter(
      (entry) => entry.status === 1
    ).length
    const totalAbsent = student.attendance.filter(
      (entry) => entry.status === 0
    ).length
    const pTotal = totalPresent * 5
    const xTotal = totalAbsent * 5

    const fullName = `${student.surname} ${
      student.firstname
    } ${student.middlename.toUpperCase()}`
    const row = [
      index + 1,
      student.randomId,
      fullName,
      student.presentClass,
      ...allDates.map((date) => {
        const entry = student.attendance.find(
          (t) => t.date.toLocaleDateString('en-GB') === date
        )
        return entry ? (entry.status === 1 ? 5 : 0) : ''
      }),
      pTotal,
      xTotal,
    ]
    worksheetData.push(row)
  })

  // console.log(worksheetData)

  // Step 3: Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance')

  // Step 4: Write to buffer and send file
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx')
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
  res.send(buffer)
}

// 📊 Attendance Analytics
export const getAttendanceAnalytics = async (req, res) => {
  try {
    const { schoolId, cohort, fromDate, toDate, term, session, month, year, presentClass } = req.query;
    
    // Build match for students
    const studentMatch = {};
    if (schoolId && schoolId !== 'all') {
      if (schoolId.includes(',')) {
        studentMatch.schoolId = { $in: schoolId.split(',') };
      } else {
        studentMatch.schoolId = schoolId;
      }
    }
    if (cohort) studentMatch.cohort = Number(cohort);
    if (presentClass) studentMatch.presentClass = presentClass;

    const students = await Student.find(studentMatch).select('_id').lean();
    const studentIds = students.map(s => s._id);

    // Build match for attendance
    const attendanceMatch = { studentId: { $in: studentIds } };
    if (fromDate || toDate) {
      attendanceMatch.date = {};
      if (fromDate) attendanceMatch.date.$gte = new Date(fromDate);
      if (toDate) attendanceMatch.date.$lte = new Date(toDate);
    }
    if (term) attendanceMatch.term = term;
    if (session) attendanceMatch.session = session;
    if (month) attendanceMatch.month = Number(month);
    if (year) attendanceMatch.year = Number(year);

    const attendanceRecords = await NewAttendance.find(attendanceMatch).lean();

    // Calculate totals for statuses (0: absent, 1: present, 2: transferred, 3: dropout, 4: died)
    const stats = {
      totalStudents: students.length,
      total: attendanceRecords.length,
      absent: 0,
      present: 0,
      transferred: 0,
      dropout: 0,
      died: 0
    };

    attendanceRecords.forEach(record => {
      if (record.status === 0) stats.absent++;
      else if (record.status === 1) stats.present++;
      else if (record.status === 2) stats.transferred++;
      else if (record.status === 3) stats.dropout++;
      else if (record.status === 4) stats.died++;
    });

    res.status(200).json({ stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching attendance analytics' });
  }
};

// 📈 Monthly Attendance Trend
export const getMonthlyAttendanceTrend = async (req, res) => {
  try {
    const { schoolId, month, year } = req.query; // month is 1-12
    if (!month || !year) {
      return res.status(400).json({ message: 'Missing month or year' });
    }

    const m = Number(month) - 1; // 0-indexed for Date
    const y = Number(year);

    const startOfMonth = new Date(y, m, 1);
    const endOfMonth = new Date(y, m + 1, 1);

    const studentMatch = {};
    if (schoolId && schoolId !== 'all') {
      if (schoolId.includes(',')) {
        studentMatch.schoolId = { $in: schoolId.split(',') };
      } else {
        const schoolIdObj = schoolId.length === 24 ? schoolId : null; // Validation could be needed
        if (schoolIdObj) studentMatch.schoolId = schoolIdObj;
      }
    }
    
    let studentIds = [];
    if (Object.keys(studentMatch).length > 0) {
      const students = await Student.find(studentMatch).select('_id').lean();
      studentIds = students.map(s => s._id);
    }

    const attendanceMatch = {
      date: { $gte: startOfMonth, $lt: endOfMonth }
    };

    if (studentIds.length > 0 || schoolId) {
       attendanceMatch.studentId = { $in: studentIds };
    }

    const attendanceRecords = await NewAttendance.find(attendanceMatch).lean();

    // Group by day of the month
    const trend = {};
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      trend[i] = { present: 0, absent: 0, total: 0 };
    }

    attendanceRecords.forEach(record => {
      const day = record.date.getUTCDate();
      if (trend[day]) {
         trend[day].total++;
         if (record.status === 1) trend[day].present++;
         if (record.status === 0) trend[day].absent++;
      }
    });

    res.status(200).json({ trend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching monthly trend' });
  }
};

export const getStudentsForAttendance = async (req, res) => {
  try {
    const { schoolId, presentClass } = req.query;
    console.log("getStudentsForAttendance HIT! query:", req.query);
    if (!schoolId) return res.status(400).json({ message: 'schoolId is required' });

    const matchQuery = {
      schoolId,
      accountNumber: { $nin: [null, '', ' '] }
    };
    
    if (presentClass) {
      matchQuery.presentClass = presentClass;
    }
    
    console.log("getStudentsForAttendance matchQuery:", matchQuery);

    // Only get students with an account number and specific class
    const students = await Student.find(matchQuery).sort({ surname: 1 }).select('_id surname firstname middlename accountNumber isActive');
    
    console.log(`getStudentsForAttendance found ${students.length} students`);

    res.status(200).json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching students for attendance' });
  }
};

import { TermlyAverage } from '../models/index.js';

export const createOrUpdateTermlyAverage = async (req, res) => {
  const { studentId, term, session, averageScore } = req.body;
  if (!studentId || !term || !session || typeof averageScore !== 'number') {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const record = await TermlyAverage.findOneAndUpdate(
      { studentId, term, session },
      { averageScore },
      { new: true, upsert: true }
    );
    res.status(200).json({ record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving termly average' });
  }
};

export const getTermlyAverage = async (req, res) => {
  const { studentId, term, session } = req.query;
  try {
    const query = {};
    if (studentId) query.studentId = studentId;
    if (term) query.term = term;
    if (session) query.session = session;
    const records = await TermlyAverage.find(query);
    res.status(200).json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching termly averages' });
  }
};

// 📊 Result Average Features
export const exportEmptyAverageSheet = async (req, res) => {
  try {
    const { schoolId, presentClass } = req.query;
    if (!schoolId) return res.status(400).json({ message: 'School ID is required' });

    const query = { schoolId };
    if (presentClass) query.presentClass = presentClass;
    
    // Fetch beneficiaries (we'll fetch matching students)
    const students = await Student.find(query).lean();
    
    const data = students.map(s => ({
      'Student ID': s._id.toString(),
      'Random ID': s.randomId || '',
      'Name': `${s.surname || ''} ${s.firstname || ''} ${s.middlename || ''}`.trim(),
      'Account Number': s.accountNumber || '',
      'Class': s.presentClass || '',
      'Term': 'First', // Default
      'Session': '2025/2026', // Default
      'Average Score': '' // Empty for user to fill
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Result Average Template');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=result_average_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error exporting template' });
  }
};

export const importAverageRecords = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (!data.length) {
      return res.status(400).json({ message: 'Excel sheet is empty' });
    }

    let successCount = 0;
    const bulkOps = [];

    for (const row of data) {
      const studentId = row['Student ID'];
      const term = row['Term'];
      const session = row['Session'];
      const score = row['Average Score'];

      if (studentId && term && session && score !== undefined && score !== '') {
        bulkOps.push({
          updateOne: {
            filter: { studentId, term, session },
            update: { $set: { averageScore: Number(score) } },
            upsert: true
          }
        });
        successCount++;
      }
    }

    if (bulkOps.length > 0) {
      await TermlyAverage.bulkWrite(bulkOps);
    }

    res.status(200).json({ message: `Successfully imported ${successCount} records.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error importing records' });
  }
};

export const exportAverageRecords = async (req, res) => {
  try {
    const { schoolId, cohort } = req.query;
    
    // First find matching students
    const studentQuery = {};
    if (schoolId && schoolId !== 'all') studentQuery.schoolId = schoolId;
    if (cohort) studentQuery.cohort = Number(cohort);

    const students = await Student.find(studentQuery).select('_id randomId surname firstname middlename accountNumber presentClass').lean();
    const studentIds = students.map(s => s._id);

    const studentMap = {};
    students.forEach(s => {
      studentMap[s._id.toString()] = s;
    });

    const records = await TermlyAverage.find({ studentId: { $in: studentIds } }).lean();

    const data = records.map(r => {
      const s = studentMap[r.studentId.toString()] || {};
      return {
        'Student ID': r.studentId.toString(),
        'Random ID': s.randomId || '',
        'Name': `${s.surname || ''} ${s.firstname || ''} ${s.middlename || ''}`.trim(),
        'Account Number': s.accountNumber || '',
        'Class': s.presentClass || '',
        'Term': r.term,
        'Session': r.session,
        'Average Score': r.averageScore
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Result Averages');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=result_averages.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error exporting records' });
  }
};

export const getAverageChartData = async (req, res) => {
  try {
    const { schoolId, session } = req.query;
    if (!schoolId || !session) {
      return res.status(400).json({ message: 'schoolId and session are required' });
    }

    const students = await Student.find({ schoolId }).select('_id').lean();
    const studentIds = students.map(s => s._id);

    const records = await TermlyAverage.find({
      studentId: { $in: studentIds },
      session
    }).lean();

    // Group by term and calculate average
    const termStats = {
      'First': { totalScore: 0, count: 0 },
      'Second': { totalScore: 0, count: 0 },
      'Third': { totalScore: 0, count: 0 }
    };

    records.forEach(r => {
      if (termStats[r.term]) {
        termStats[r.term].totalScore += r.averageScore;
        termStats[r.term].count++;
      }
    });

    const chartData = {
      'First': termStats['First'].count > 0 ? (termStats['First'].totalScore / termStats['First'].count).toFixed(2) : 0,
      'Second': termStats['Second'].count > 0 ? (termStats['Second'].totalScore / termStats['Second'].count).toFixed(2) : 0,
      'Third': termStats['Third'].count > 0 ? (termStats['Third'].totalScore / termStats['Third'].count).toFixed(2) : 0
    };

    res.status(200).json({ chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching chart data' });
  }
};
