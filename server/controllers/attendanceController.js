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

export const createOrUpdateAttendance = async (req, res) => {
  const { studentId, date, present } = req.body

  // Check if all necessary fields are present
  if (!studentId || !date || typeof present !== 'boolean') {
    return res
      .status(400)
      .json({ message: 'Missing required fields (studentId, date, present).' })
  }

  try {
    // Update or create attendance for the student on a specific date
    const updatedAttendance = await NewAttendance.findOneAndUpdate(
      { studentId, date: new Date(date) }, // search criteria
      { $set: { present } }, // update action
      { new: true, upsert: true } // new document if not found
    )

    res.status(200).json({
      message: 'NewAttendance recorded successfully.',
      attendance: updatedAttendance,
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({ message: 'Error processing attendance.' })
  }
}

// 🔍 Get NewAttendance by Month and School

export const getAttendanceTable = async (req, res, next) => {
  // console.log(req.query)
  // console.log(req.query);
  let { schoolId, year, month, page = 1, limit = 25, presentClass } = req.query
  year = Number(year)
  month = Number(month) - 1
  if (!schoolId || !year || !month) {
    return res.status(400).json({ message: 'Missing schoolId, year, or month' })
  }

  const basket = {}

  if (presentClass) basket.presentClass = presentClass
  if (schoolId) basket.schoolId = schoolId

  try {
    const skip = (page - 1) * limit

    // 1. Get all students in this school
    const students = await Student.find(basket)
      .collation({ locale: 'en', strength: 1 })
      .sort({ surname: 1 })
      .limit(limit)
      .skip(skip)
    const totalStudents = await Student.countDocuments({ schoolId })

    // console.log('students', students)
    // 2. Get all attendance records for those students in that month
    const startOfMonth = new Date(year, month, 1)

    const endOfMonth = new Date(year, month + 1, 1) // 1st of next month
    // next month, same day (i.e. 1st of next month)

    // Then query using date range
    const attendance = await NewAttendance.find({
      studentId: { $in: students.map((s) => s._id) },
      date: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    })

    // 3. Build response structure
    const daysInMonth = new Date(year, month + 1, 0).getDate() // e.g. 31
    // console.log(
    //   startOfMonth.toLocaleString(),
    //   endOfMonth.toLocaleString(),
    //   daysInMonth,
    //   month,
    //   year
    // )

    const table = students.map((student) => {
      // Filter this student’s attendance records

      const studentAttendance = attendance.filter(
        (a) => a.studentId.toString() === student._id.toString()
      )

      // const dailyRecords = []

      // const dailyRecords = Array.from({ length: daysInMonth }, (_, i) => {
      //   const day = i + 1
      //   const record = studentAttendance.find((r) => {
      //     const getDay = r.date.getDate() // 1 - 31

      //     // console.log('getDay', getDay)
      //     return getDay === day
      //   })

      //   return {
      //     date: new Date(Date.UTC(year, month, day)),
      //     present: record ? record.present : false, // false = not marked
      //   }
      // })

      const dailyRecords = []

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(Date.UTC(year, month, day))
        const dayOfWeek = dateObj.getUTCDay() // 0 = Sunday, 6 = Saturday

        // Skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) continue

        const record = studentAttendance.find((r) => {
          return r.date.getUTCDate() === day && r.date.getUTCMonth() === month
        })

        dailyRecords.push({
          date: dateObj,
          present: record ? record.present : false,
        })
      }

      if (req.query.middlewareOnly === 'true') {
        return {
          randomId: student.randomId,
          studentId: student._id,
          firstname: student.firstname,
          surname: student.surname,
          middlename: student?.middlename || '',
          attendance: dailyRecords,
          presentClass: student.presentClass,
        }
      }

      return {
        studentId: student._id,
        firstname: student.firstname,
        surname: student.surname,
        middlename: student?.middlename || '',
        attendance: dailyRecords,
      }
    })

    // console.log(req.query.middlewareOnly === 'true')
    
    if (req.query.middlewareOnly === 'true') {
      const school = await AllSchools.findOne({ _id: schoolId });

      // console.log('middleawate')
      req.attandanceRecordTable = {
        table,
        school:school.schoolName,
      }
      return next()
    }

    res.status(200).json({
      message: 'NewAttendance table ready',
      table,
      currentPage: Number(page),
      totalPages: Math.ceil(totalStudents / limit),
      totalStudents: Number(totalStudents),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Error building attendance table' })
  }
}

export const downloadAttendanceRecordExcel = async (req, res) => {
  // Simulated attendance data from DB
  const studentsAttendance = req.attandanceRecordTable.table
  const schoolName = req.attandanceRecordTable.school
  // Step 1: Get all unique dates
  // const allDatesSet = new Set()
  // studentsAttendance.forEach((student) => {
  //   student.attendance.forEach((entry) => {
  //     // console.log(entry)
  //     const formattedDate = new Date(entry.date).toLocaleDateString('en-GB')
  //     // Output: '04/07/2025'
  //     // console.log(splitedDate)
  //     allDatesSet.add(formattedDate)
  //   })
  // })

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
      (entry) => entry.present === true
    ).length
    const totalAbsent = student.attendance.filter(
      (entry) => entry.present === false
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
        return entry ? (entry.present ? 5 : 0) : ''
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
