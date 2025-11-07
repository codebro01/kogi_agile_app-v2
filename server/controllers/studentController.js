import {
  Student,
  Permissions,
  Registrar,
  PayrollSpecialist,
  Attendance,
  Verification,
  Payment,
  DeletedStudents,
} from '../models/index.js'
import { StatusCodes } from 'http-status-codes'
import {
  BadRequestError,
  NotFoundError,
  NotAuthenticatedError,
} from '../errors/index.js'
import { addLogToUser } from '../utils/index.js'
import XLSX from 'xlsx'
import { fileURLToPath } from 'url'
import { dirname, parse } from 'path'
import path from 'path'
import fs, { copyFileSync } from 'fs'
import { Readable } from 'stream'
import { generateStudentsRandomId } from '../utils/index.js'
import mongoose from 'mongoose'
import { MongoClient } from 'mongodb'
import { AllSchools } from '../models/index.js'

const { ObjectId } = mongoose.Types

const client = new MongoClient(process.env.MONGO_URI)

const fetchExistingData = async () => {
  try {
    await client.connect()
    const database = client.db('KOGI_AGILE_DB_TEST')
    const collection = database.collection('scoregrade')

    // Fetch data
    const data = await collection.find({}).toArray()
    return { data }
  } catch (error) {
    console.error('Error accessing data:', error)
    return new Error('an error occured fetching grade')
  } finally {
    await client.close()
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const getAllStudents = async (req, res, next) => {
  try {
    // await Student.syncIndexes();

    const { userID, permissions } = req.user
    //  if(!userID) return next(new NotAuthenticatedError('Not authorized to get students'));

    const {
      ward,
      schoolId,
      lgaOfEnrollment,
      presentClass,
      nationality,
      state,
      enumerator,
      dateFrom,
      dateTo,
      year,
      yearOfAdmission,
      classAtEnrollment,
      yearOfEnrollment,
      page,
      limit,
    } = req.query

    // Create a basket object
    let basket
    if (permissions.includes('handle_students') && permissions.length === 1) {
      basket = { createdBy: userID }
    } else {
      basket = {}
    }
    if (lgaOfEnrollment) basket.lgaOfEnrollment = lgaOfEnrollment
    if (presentClass) basket.presentClass = presentClass
    if (classAtEnrollment) basket.classAtEnrollment = classAtEnrollment
    if (yearOfEnrollment) basket.yearOfEnrollment = yearOfEnrollment
    if (ward) basket.ward = ward
    if (schoolId) basket.schoolId = schoolId
    if (nationality) basket.nationality = nationality
    if (state) basket.stateOfOrigin = state
    if (enumerator) basket.createdBy = enumerator
    if (dateFrom || dateTo) {
      basket.createdAt = {}
      if (dateFrom) basket.createdAt.$gte = new Date(dateFrom)
      if (dateTo) basket.createdAt.$lte = new Date(dateTo)
    }
    if (year) basket.year = year
    if (yearOfAdmission) basket.yearAdmitted = yearOfAdmission

    // if (!lgaOfEnrollment && !presentClass && !classAtEnrollment && !yearOfEnrollment && !ward && !schoolId && !nationality && !state && !enumerator) {
    //     return next('Please enter at least a filter to avoid loading large data of students');
    // }

    const skip = (page - 1) * limit

    const total = await Student.countDocuments()

    let students = await Student.find(basket)
      .populate('schoolId')
      .sort('-updatedAt')
      .collation({ locale: 'en', strength: 2 })
      .select(
        'randomId schoolId surname firstname middlename dob stateOfOrigin lga lgaOfEnrollment presentClass ward bankName yearOfEnrollment passport studentNin gender nationality communityName parentName parentPhone parentNin parentBvn bankName accountNumber parentOccupation residentialAddress disabilitystatus'
      )
      .skip(skip)
      .limit(Number(limit))
      .lean()

    if (permissions.includes('handle_admins')) {
      students = await Student.find(basket)
        .populate('schoolId')
        .sort('-updatedAt')
        .collation({ locale: 'en', strength: 2 })
        .select(
          'randomId schoolId surname firstname middlename dob stateOfOrigin lga lgaOfEnrollment presentClass ward bankName yearOfEnrollment passport src'
        )
        .skip(skip)
        .limit(Number(limit))
        .lean()
    }

    return res.status(StatusCodes.OK).json({ students, total })
  } catch (err) {
    console.log(err)
    return next(err)
  }
}

export const getStudentsStats = async (req, res, next) => {
  try {
    const pipeline = [
      // Lookup the school details for each student
      {
        $lookup: {
          from: 'allschools', // Name of the schools collection
          localField: 'schoolId', // Reference field in students
          foreignField: '_id', // Field in schools collection
          as: 'schoolDetails', // Name for the joined field
        },
      },
      // Unwind the school details array
      {
        $unwind: {
          path: '$schoolDetails',
          preserveNullAndEmptyArrays: true, // In case some students don't have a school reference
        },
      },
      // Stage 1: Calculate Total Students
      {
        $facet: {
          totalStudents: [
            { $count: 'total' }, // Count all students
          ],
          studentsByClass: [
            {
              $group: {
                _id: '$presentClass', // Group by class
                totalStudentsInClass: { $sum: 1 }, // Count the number of students in each class
              },
            },
            {
              $project: {
                className: '$_id', // Rename the field for clarity
                totalStudentsInClass: 1, // Retain the count
                _id: 0, // Exclude the original `_id` field
              },
            },
          ],
          distinctSchools: [
            {
              $group: {
                _id: '$schoolId', // Group by unique school ID
              },
            },
            {
              $count: 'totalDistinctSchools', // Count unique schools
            },
          ],
          distinctSchoolsDetails: [
            {
              $lookup: {
                from: 'allschools',
                localField: 'schoolId',
                foreignField: '_id',
                as: 'schoolDetails',
              },
            },
            {
              $unwind: {
                path: '$schoolDetails',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: '$schoolId',
                schoolDetails: { $first: '$schoolDetails' }, // Get the first (and only) school detail for each schoolId
              },
            },
            {
              $project: {
                _id: 0, // Remove the _id field
                schoolId: '$_id', // Rename _id to schoolId
                schoolName: '$schoolDetails.schoolName',
                schoolLGA: '$schoolDetails.LGA',
                schoolCode: '$schoolDetails.schoolCode',
                // schoolId: '$schoolDetails._id',
              },
            },
          ],
        },
      },
    ]

    const schoolCategoryPipeline = [
      // Step 1: Lookup school details
      {
        $lookup: {
          from: 'allschools', // Name of the schools collection
          localField: 'schoolId', // Reference field in students
          foreignField: '_id', // Field in schools collection
          as: 'schoolDetails',
        },
      },
      // Step 2: Unwind school details to process individual records
      {
        $unwind: {
          path: '$schoolDetails',
          preserveNullAndEmptyArrays: false, // Exclude students without valid school references
        },
      },
      // Step 3: Get unique schools
      {
        $group: {
          _id: '$schoolId', // Group by school ID to ensure uniqueness
          schoolCategory: { $first: '$schoolDetails.schoolCategory' }, // Keep school category
        },
      },
      // Step 4: Categorize schools and calculate totals
      {
        $facet: {
          totalUbeJss: [
            {
              $match: {
                schoolCategory: { $in: ['Public JSS', 'UBE/JSS'] },
              },
            },
            { $count: 'total' }, // Count all secondary schools
          ],
          totalJssSss: [
            {
              $match: {
                schoolCategory: { $in: ['JSS/SSS', 'Public JSS/SSS'] },
              },
            },
            { $count: 'total' }, // Count all secondary schools
          ],
          totalPrimarySchools: [
            {
              $match: {
                schoolCategory: {
                  $in: [
                    'ECCDE',
                    'ECCDE AND PRIMARY',
                    'PRIMARY',
                    'PRIMARY  ',
                    'Primary',
                  ],
                },
              },
            },
            { $count: 'total' }, // Count all primary schools
          ],
          totalScienceAndVocational: [
            {
              $match: {
                schoolCategory: {
                  $in: ['Science & Vocational', 'TECHNICAL', 'Technical'],
                },
              },
            },
            { $count: 'total' }, // Count all science and vocational schools
          ],
        },
      },
      // Step 5: Reshape the results
      {
        $project: {
          totalJssSss: {
            $arrayElemAt: ['$totalJssSss.total', 0],
          },
          totalUbeJss: {
            $arrayElemAt: ['$totalUbeJss.total', 0],
          },
          totalPrimarySchools: {
            $arrayElemAt: ['$totalPrimarySchools.total', 0],
          },
          totalScienceAndVocational: {
            $arrayElemAt: ['$totalScienceAndVocational.total', 0],
          },
        },
      },
    ]

    const results = await Student.aggregate(pipeline)
    const schoolCategory = await Student.aggregate(schoolCategoryPipeline)
    const recentTwentyStudents = await Student.find({})
      .limit(20)
      .sort('createdAt')

    res.status(200).json({ results, schoolCategory, recentTwentyStudents })
  } catch (err) {
    console.log(err)
    return next(err)
  }
}

export const filterAndDownload = async (req, res, next) => {
  try {
    await Student.syncIndexes()

    const { userID, permissions } = req.user

    const {
      verified,
      ward,
      schoolId,
      lga,
      presentClass,
      sortBy,
      sortOrder,
      nationality,
      stateOfOrigin,
      enumerator,
      dateFrom,
      dateTo,
      yearOfAdmission,
      yearOfEnrollment,
      status,
      disabilitystatus,
      schoolType,
      cohort,
    } = req.query

    // Create a basket object
    let basket

    if (!permissions.includes('handle_registrars')) {
      basket = { createdBy: userID }
    } else {
      basket = {}
    }
    if ((status && status === 'active') || !status) basket.isActive = true
    if (status && status === 'inactive') basket.isActive = false
    if (status && status === 'all') basket.isActive
    if (lga) basket.lgaOfEnrollment = lga
    if (presentClass) basket.presentClass = presentClass
    if (yearOfEnrollment) basket.yearOfEnrollment = yearOfEnrollment
    if (ward) basket.ward = ward
    if (schoolId) basket.schoolId = schoolId
    // if (schoolType) basket.schoolCategory = schoolType
    if (nationality) basket.nationality = nationality
    if (cohort) basket.cohort = cohort
    if (stateOfOrigin) basket.stateOfOrigin = stateOfOrigin
    if (disabilitystatus) basket.disabilitystatus = disabilitystatus
    if (enumerator) basket.createdBy = enumerator

    if (dateFrom || dateTo) {
      basket.createdAt = {}

      // Handle dateFrom
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        if (isNaN(fromDate)) {
          return next(new BadRequestError('Invalid dateFrom format'))
        }
        basket.createdAt.$gte = fromDate
      }

      // Handle dateTo
      if (dateTo) {
        const toDate = new Date(new Date(dateTo).setHours(23, 59, 59, 999))
        if (isNaN(toDate)) {
          return next(new BadRequestError('Invalid dateTo format'))
        }
        basket.createdAt.$lte = toDate
      }

      // Clean up empty `createdAt` filter
      if (Object.keys(basket.createdAt).length === 0) {
        delete basket.createdAt
      }
    }

    // console.log(req.url)
    // console.log(req.query)
    // console.log(basket)

    // if (yearOfAdmission) basket.yearAdmitted = yearOfAdmission;

    let sort = { createdAt: -1 } // Default sort
    if (sortBy && sortOrder) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1
    }

    // console.log(basket)

    let students

    students = await Student.find(basket)
      .populate('schoolId')
      .populate('ward')
      .populate('createdBy')
      .populate('verificationInfo')
      .sort(sort)
      .collation({ locale: 'en', strength: 2 })
      .lean()

    if (verified === 'true')
      students = students.filter(
        (student) => student.verificationStatus === true
      )
    if (verified === 'false')
      students = students.filter(
        (student) => student.verificationStatus !== true
      )

    students = students.map((student) => {
      const verification = student.verificationInfo || {}
      if (!student.verificationStatus) verification.verified === false
      return {
        ...student,
        verified: verification.verified || false,
        // cardNo: verification.cardNo || null,
        // verificationImage: verification.verificationImage || null,
        // reasonNotVerified: verification.reasonNotVerified || null,
      }
    })

    console.log(basket, 'students', students)

    if (schoolType) {
      students = students.filter(
        (student) => student.schoolId?.schoolCategory === schoolType
      )
    }

    if (students.length < 1) {
      return next(
        new NotFoundError('No students with the filtered data provided')
      )
    }

    // const allKeys = new Set();
    // students.forEach(student => {
    //     Object.keys(student).forEach(key => allKeys.add(key));
    // });
    const orderedHeaders = [
      'S/N',
      'schoolName',
      'schoolCategory',
      'surname',
      'firstname',
      'middlename',
      'randomId',
      'gender',
      'dob',
      'presentClass',
      'cohort',
      'verified',
      'nationality',
      'stateOfOrigin',
      'lga',
      'studentNin',
      'lgaOfEnrollment',
      'ward',
      'communityName',
      'residentialAddress',
      'yearOfEnrollment',
      'parentName',
      'parentPhone',
      'parentOccupation',
      'parentNin',
      'parentBvn',
      'bankName',
      'accountNumber',
      'lastLogged',
      'createdAt',
      'createdBy',
    ]

    const headers = [
      'S/N',
      'schoolId',
      'schoolName',
      'schoolCategory',
      ...orderedHeaders.filter(
        (header) =>
          header !== 'S/N' &&
          header !== 'schoolName' &&
          students.some((student) => student.hasOwnProperty(header))
      ),
    ]

    const uppercaseHeaders = headers.map((header) => header.toUpperCase())

    let count = 1
    const formattedData = students.map((student) => {
      const row = {}
      headers.forEach((header, index) => {
        const uppercaseHeader = uppercaseHeaders[index]
        // Populate fields like _id, schoolId, ward, createdBy with actual readable data
        if (header === 'S/N') {
          row[uppercaseHeader] = count++ // Ensure _id is a string
        } else if (header === 'createdBy' && student[header]) {
          row[uppercaseHeader] = student[header].fullName?.toUpperCase() || ''
        } else if (student[header] && header === 'schoolId') {
          row[uppercaseHeader] = student[header]?.schoolCode || ''
        } else if (student[header] && header === 'randomId') {
          row[uppercaseHeader] = student.randomId || ''
        } else if (header === 'schoolName') {
          row[uppercaseHeader] =
            student.schoolId?.schoolName?.toUpperCase() || ''
        } else if (header === 'schoolCategory') {
          row[uppercaseHeader] =
            student.schoolId?.schoolCategory?.toUpperCase() || ''
        } else {
          row[uppercaseHeader] = student[header]?.toString().toUpperCase() || ''
        }
      })
      return row
    })

    // Create a workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(formattedData, {
      header: uppercaseHeaders,
    })

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

    // Create a buffer for the Excel file
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

    // Create a readable stream from the buffer
    const stream = Readable.from(buffer)

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=students.xlsx`)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

    // Pipe the stream to the response
    stream.pipe(res)

    // Optional: Handle error during streaming
    stream.on('error', (err) => {
      console.error('Stream error:', err)
      res.status(500).send('Error generating file')
    })

    // End the response once the stream is finished
    stream.on('end', () => {
      console.log('File sent successfully')

      // Ensure the file exists before attempting deletion
      fs.unlink('../server/utils/uploads/students.xlsx', (err) => {
        if (err) {
          console.error('Error deleting file:', err)
        } else {
          console.log('File deleted successfully')
        }
      })
    })
  } catch (err) {
    return next(err)
    console.log(err)
  }
}

export const filterAndView = async (req, res, next) => {
  try {
    await Student.syncIndexes()
    // console.log(req.url.split('?'))
    // console.log(req.query)
    const { userID, permissions } = req.user
    const {
      ward,
      schoolId,
      lga,
      presentClass,
      nationality,
      stateOfOrigin,
      enumerator,
      dateFrom,
      dateTo,
      yearOfAdmission,
      yearOfEnrollment,
      disabilitystatus,
      cohort,
      verified,
    } = req.query.filteredParams || {}
    const { page, limit } = req.query
    const { sortBy, sortOrder } = req.query.sortParam
    let { status } = req.query.filteredParams

    // Create a basket object
    let basket
    if (permissions.includes(['handle_students'] && permissions.length === 1)) {
      basket = { createdBy: userID }
    } else {
      basket = {}
    }
    if ((status && status === 'active') || !status) basket.isActive = true
    if (status && status === 'inactive') basket.isActive = false
    if (status && status === 'all') basket.isActive
    if (lga) basket.lgaOfEnrollment = lga
    if (presentClass) basket.presentClass = presentClass
    if (disabilitystatus) basket.disabilitystatus = disabilitystatus
    if (yearOfEnrollment) basket.yearOfEnrollment = yearOfEnrollment
    if (ward) basket.ward = ward
    if (schoolId) basket.schoolId = schoolId
    if (nationality) basket.nationality = nationality
    if (stateOfOrigin) basket.stateOfOrigin = stateOfOrigin
    if (verified === 'true') basket.verificationStatus = true
    if (verified === 'false') basket.verificationStatus = false
    if (enumerator) basket.createdBy = enumerator
    if (cohort) basket.cohort = parseInt(cohort)
    if (dateFrom || dateTo) {
      basket.createdAt = {}
      // Handle dateFrom
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        if (isNaN(fromDate)) {
          return next(new BadRequestError('Invalid dateFrom format'))
        }
        basket.createdAt.$gte = fromDate.toISOString()
      }

      // Handle dateTo
      if (dateTo) {
        const toDate = new Date(dateTo) // Create a Date object from dateTo
        if (isNaN(toDate)) {
          return next(new BadRequestError('Invalid dateTo format'))
        }
        toDate.setHours(23, 59, 59, 999) // Set the time to the end of the day (23:59:59.999)

        basket.createdAt = basket.createdAt || {} // Ensure createdAt exists on basket
        basket.createdAt.$lte = toDate.toISOString() // Use the Date object for $lte
      }
      // Clean up empty `createdAt` filter
      if (Object.keys(basket.createdAt).length === 0) {
        delete basket.createdAt
      }
    }

    // console.log(req.url)
    // console.log(basket)

    // if (yearOfAdmission) basket.yearAdmitted = yearOfAdmission;

    let sort = { createdAt: -1 } // Default sort
    if (sortBy && sortOrder) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1
    }

    // console.log(req.query, req.url);

    const skip = (page - 1) * limit

    const total = await Student.countDocuments(basket)

    const students = await Student.find({ ...basket })
      .populate('schoolId')
      .populate('ward')
      .populate({
        path: 'createdBy',
        select: '-password', // Exclude the password field
      })
      .populate({
        path: 'verificationInfo', // 💥 this is your virtual populate
      })
      .sort(sort)
      .collation({ locale: 'en', strength: 2 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()
    // console.log(students)
    // console.log(basket)
    const studentsWithVerification = students.map((student) => {
      const verification = student.verificationInfo || {}
      return {
        ...student,
        verified: verification.verified || false,
        cardNo: verification.cardNo || null,
        verificationImage: verification.verificationImage || null,
        reasonNotVerified: verification.reasonNotVerified || null,
        verificationCreatedAt: verification.createdAt || null, // add this
      }
    })

    // sort students with verification by created At

    studentsWithVerification.sort((a, b) => {
      const dateA = new Date(a.verificationCreatedAt)
      const dateB = new Date(b.verificationCreatedAt)
      return dateA - dateB // Ascending order
    })

    // console.log(studentsWithVerification.map(student => student.verificationInfo.createdAt))
    // console.log(students)
    // console.log(students.length)

    res.status(200).json({ students: studentsWithVerification, total })
  } catch (err) {
    console.log(err)
    return next(err)
  }
}

export const filterEnumeratorsByStudents = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query

    // Initialize the filter object
    const filter = {}

    // Add date range filters if provided
    if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) }
    }
    if (endDate) {
      filter.createdAt = filter.createdAt || {} // Ensure createdAt exists
      filter.createdAt.$lte = new Date(endDate)
    }

    // Filter by enumeratorId if provided

    // Query the database with the constructed filter
    const students = await Student.find(filter).populate('createdBy').limit(20)

    return res.status(200).json({
      count: students.length,
      students,
    })
  } catch (error) {
    return next(error)
  }
}

export const totalStudentsByEnumerators = async (req, res, next) => {
  try {
    const pipeline = [
      // Step 1: Lookup enumerator details from the registrars collection
      {
        $lookup: {
          from: 'students', // The name of the students collection
          localField: '_id', // The enumerator's ID in the registrars collection
          foreignField: 'createdBy', // The field in the students collection referencing the enumerator
          as: 'studentDetails', // The output array of students
        },
      },
      // Step 2: Add a field to count the number of students for each enumerator
      {
        $addFields: {
          totalStudents: { $size: '$studentDetails' }, // Count the size of the studentDetails array
        },
      },
      // Step 3: Format the output to match the required structure
      {
        $project: {
          _id: 0, // Exclude the `_id` field if not needed
          enumeratorId: '$_id', // Include the enumerator ID
          totalStudents: 1, // Include the total count of students
          'enumeratorDetails.randomId': '$_id', // Include enumerator `_id`
          'enumeratorDetails.fullName': '$fullName', // Include enumerator name
          'enumeratorDetails.email': '$email', // Include enumerator email
          'enumeratorDetails.isActive': '$isActive', // Include enumerator email
        },
      },
    ]

    const countStudentsByEnumerators = await Registrar.aggregate(pipeline)

    res.status(200).json({ countStudentsByEnumerators })
  } catch (error) {
    return next(error)
  }
}

export const downloadAttendanceSheet = async (req, res, next) => {
  try {
    const { userID, permissions } = req.user
    const currentUser = await Registrar.findOne({ _id: userID })
    const { schoolId, createdBy } = req.query

    let filterBasket

    if (permissions.includes('handle_admins')) {
      filterBasket = { isActive: true }
    } else {
      filterBasket = { createdBy: userID, isActive: true }
    }

    if (schoolId) filterBasket.schoolId = schoolId
    if (createdBy) filterBasket.createdBy = createdBy

    const students = await Student.find(filterBasket)
      .populate('schoolId')
      .populate('ward')

    if (!students.length) {
      return next(
        new NotFoundError(
          `We can't find students registered by you in this particular school`
        )
      )
    }
    // Prepare data for the sheet
    const toUpperCaseStrings = (obj) => {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          key === 'StudentId'
            ? value
            : typeof value === 'string'
            ? value.toUpperCase()
            : value,
        ])
      )
    }
    let count = 1
    const schoolName = students[0]?.schoolId?.schoolName || 'Unknown School'
    const formattedData = students.map((student) =>
      toUpperCaseStrings({
        'S/N': count++,
        StudentId: student.randomId,
        Surname: student.surname || '',
        Firstname: student.firstname || '',
        Middlename: student.middlename || '',
        Class: student.presentClass || '',
        'Attendance Score': '',
      })
    )

    // Create the sheet with headers
    const rows = [
      [schoolName], // Big header (School Name)
      [], // Blank row for spacing
      [
        'S/N',
        'StudentId',
        'Surname',
        'Firstname',
        'Middlename',
        'Class',
        'AttendanceScore',
      ], // Column headers
      ...formattedData.map((row) => Object.values(row)), // Data rows
    ]

    // Create a workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(rows)

    // Merge cells for the major header (School Name)
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }] // Merge A1:D1

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

    // Instead of writing the file to disk, we stream the content to the client
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

    // Create a readable stream from the buffer
    const stream = Readable.from(buffer)

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=students.xlsx`)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

    // Pipe the stream to the response
    stream.pipe(res)

    // Optional: Handle error during streaming
    stream.on('error', (err) => {
      console.error('Stream error:', err)
      res.status(500).send('Error generating file')
    })

    // End the response once the stream is finished
    stream.on('end', () => {
      console.log('File sent successfully')

      // Ensure the file exists before attempting deletion
      fs.unlink('../server/utils/uploads/students.xlsx', (err) => {
        if (err) {
          console.error('Error deleting file:', err)
        } else {
          console.log('File deleted successfully')
        }
      })
    })
  } catch (error) {
    return next(error)
  }
}

export const uploadAttendanceSheet = async (req, res, next) => {
  // const scoreRange = await

  try {
    const existingData = await fetchExistingData()
    const { userID } = req.user
    const { week, month, year } = req.body

    let attendance

    for (const existingStudents of req.parsedData) {
      attendance = await Attendance.find({
        studentRandomId: existingStudents.StudentId,
        attdWeek: week,
        month,
        year,
      })
    }

    const minScore = 0
    const maxScore = 100

    const attendanceRecords = []
    let insertionCount = 0
    for (const row of req.parsedData) {
      const isExist = await Attendance.findOne({
        studentRandomId: row.StudentId,
        month: month,
        year: year,
        attdWeek: week,
      })

      // if (isExist) {
      //     // If attendance exists, skip this record
      //     console.log(`Attendance already exists for Student ID: ${row.StudentId}`);
      //     continue;
      // }
      try {
        if (
          row.AttendanceScore === 0 ||
          row.AttendanceScore === minScore ||
          row.AttendanceScore === maxScore ||
          (row.AttendanceScore >= minScore && row.AttendanceScore <= maxScore)
        ) {
          const studentId = row.studentRandomId
          const student = await Student.findOne({
            studentRandomId: studentId,
            isActive: true,
          })
          if (!student)
            return next(
              new BadRequestError(
                `Student with Id ${studentRandomId} is not eligible`
              )
            )
          attendanceRecords.push({
            studentRandomId: row.StudentId, // First column
            class: row.Class || '', // Class
            AttendanceScore: row.AttendanceScore || 0, // Week 1
            enumeratorId: userID, // From function arguments
            month: month, // From function arguments
            year: year, // From function arguments
            attdWeek: week,
          })
        } else {
          console.log(
            `'value bigger smaller than 20  or greater than 25' for : ${row.StudentId}`
          )
        }
      } catch (err) {
        return next(err)
      }
    }

    // console.log(attendanceRecords)
    // console.log(attendance.length)
    if (attendanceRecords.length > 0 && !attendance.length) {
      // Insert all new records into MongoDB
      await Attendance.insertMany(attendanceRecords)
    } else if (attendanceRecords.length > 0 && attendance.length) {
      const updateCount = attendance.length
      await Attendance.updateMany(
        { randomId: req.parsedData.StudentId, week, month, year },
        { ...attendanceRecords },
        { new: true, runValidators: true }
      )
      return res.status(200).json({
        message: `Attendance sheet updated  for ${updateCount} persons`,
        totalInserted: attendanceRecords.length,
      })
    } else {
      return res
        .status(400)
        .json({ message: 'No new attendance records to upload.' })
    }
    const count = attendanceRecords.length

    res.status(200).json({
      message: `Attendance sheet uploaded  for ${count} persons`,
      totalInserted: attendanceRecords.length,
    })
  } catch (error) {
    return next(error)
  }
}

export const adminViewAttendance = async (req, res, next) => {
  try {
    const { userID, permissions } = req.user
    let {
      year,
      month,
      school,
      ward,
      lgaOfEnrollment,
      presentClass,
      week,
      schoolId,
      paymentType,
      percentage,
      dateFrom,
      dateTo,
      enumerator,
    } = req.query

    const enumeratorId = enumerator
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 200
    const skip = (page - 1) * limit
    let basket = {}
    let createdBy

    if (year) basket.year = parseInt(year, 10) // Ensure year is numeric
    if (month) basket.month = parseInt(month, 10) // Ensure week is numeric
    if (school) basket.schoolId = school // Ensure month is numeric
    if (presentClass) basket.presentClass = presentClass
    if (ward) basket.ward = ward
    if (week) basket.attdWeek = week
    if (lgaOfEnrollment) basket.lgaOfEnrollment = lgaOfEnrollment
    if (enumeratorId) basket.enumeratorId = enumeratorId

    let attendance

    attendance = await Attendance.aggregate([
      {
        $lookup: {
          from: 'students', // Collection name for Student schema
          localField: 'studentRandomId', // Field in Attendance
          foreignField: 'randomId', // Field in Student schema
          as: 'studentDetails', // Output field for joined data
        },
      },
      {
        $unwind: {
          path: '$studentDetails', // Flatten joined data
        },
      },
      {
        $lookup: {
          from: 'allschools', // Collection name for School schema
          localField: 'studentDetails.schoolId', // Field in Student schema
          foreignField: '_id', // Field in School schema
          as: 'schoolDetails', // Output field for joined data
        },
      },
      {
        $unwind: {
          path: '$schoolDetails', // Flatten joined school data
          preserveNullAndEmptyArrays: true, // Keep student data even if no school match
        },
      },

      {
        $match: {
          lockStatus: false,
          ...(enumeratorId && { enumeratorId: enumeratorId }),
          ...(week && { attdWeek: Number(week) }), // Corrected from 'attWeek'
          ...(ward && { 'studentDetails.ward': ward }),
          ...(lgaOfEnrollment && {
            'studentDetails.lgaOfEnrollment': lgaOfEnrollment,
          }),
          ...(presentClass && { 'studentDetails.presentClass': presentClass }),
          ...(school && { 'studentDetails.schoolId': new ObjectId(school) }),
          ...(month && { month: Number(month) }),
          ...(year && { year: Number(year) }),
        },
      },

      {
        $project: {
          _id: 1, // Exclude MongoDB's `_id`
          year: 1,
          attdWeek: 1,
          month: 1,
          class: 1,
          studentRandomId: 1,
          AttendanceScore: 1,
          enumeratorId: 1,
          'studentDetails.surname': 1,
          'studentDetails.firstname': 1,
          'studentDetails.middlename': 1,
          'studentDetails.ward': 1,
          'studentDetails.lgaOfEnrollment': 1,
          'studentDetails.presentClass': 1,
          'studentDetails.state': 1,
          'studentDetails.accountNumber': 1,
          'studentDetails.bankName': 1,
          'schoolDetails.schoolName': 1,
          'schoolDetails._id': 1,
          'studentDetails.presentClass': 1,
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt in descending order
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }], // Count total documents
          data: [{ $skip: skip }, { $limit: limit }], // Paginate results
        },
      },
      {
        $unwind: '$metadata',
      },
      {
        $project: {
          total: '$metadata.total',
          data: 1,
        },
      },
    ])
    if (attendance.length < 1) return next(new NotFoundError('No record found'))

    return res.status(200).json({ attendance })
  } catch (error) {
    return next(error)
  }
}

export const adminDeleteAttendances = async (req, res, next) => {
  try {
    const { ids } = req.query // Access the query parameter
    const selectedAttendances = ids.split(',') // Convert to array

    if (!selectedAttendances || !selectedAttendances.length) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'No students selected for deletion.' })
    }

    const deletedAttendances = await Attendance.deleteMany({
      _id: { $in: selectedAttendances },
    })

    if (deletedAttendances.deletedCount === 0) {
      return next(new NotFoundError('No Attendance found for deletion.'))
    }

    res.status(StatusCodes.OK).json({
      message: `${deletedAttendances.deletedCount} attendances deleted successfully.`,
    })
  } catch (error) {
    next(error)
  }
}

// ! Get and export  Students attendance record
export const getStudentsAttendance = async (req, res, next) => {
  try {
    const { userID, permissions } = req.user
    let {
      year,
      month,
      school,
      ward,
      lgaOfEnrollment,
      presentClass,
      week,
      schoolId,
      paymentType,
      percentage,
      dateFrom,
      dateTo,
      withBankDetails,
    } = req.query
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 200
    const skip = (page - 1) * limit
    // lgaOfEnrollment = lgaOfEnrollment.toLowerCase();
    // ward = ward.toLowerCase();
    // Filter conditions
    let basket = {}
    let createdBy
    // if (!permissions.includes('handle_registrars')) {
    //     basket.enumeratorId = userID;
    // }

    if (withBankDetails == 'true') {
      withBankDetails = true
    } else {
      withBankDetails = false
    }
    if (permissions.includes('handle_students') && permissions.length === 1) {
      basket = { createdBy: userID }
    } else {
      basket = {}
    }

    if (year) basket.year = parseInt(year, 10) // Ensure year is numeric
    if (month) basket.month = parseInt(month, 10) // Ensure week is numeric
    if (school) basket.schoolId = school // Ensure month is numeric
    if (presentClass) basket.presentClass = presentClass
    if (ward) basket.ward = ward
    if (week) basket.attdWeek = week
    if (lgaOfEnrollment) basket.lgaOfEnrollment = lgaOfEnrollment

    // console.log('getting query and url');

    // console.log(withBankDetails)
    // return
    // console.log(req.url)
    let attendance

    attendance = await Attendance.aggregate([
      {
        $lookup: {
          from: 'students', // Collection name for Student schema
          localField: 'studentRandomId', // Field in Attendance
          foreignField: 'randomId', // Field in Student schema
          as: 'studentDetails', // Output field for joined data
        },
      },
      {
        $unwind: {
          path: '$studentDetails', // Flatten joined data
        },
      },
      {
        $lookup: {
          from: 'allschools', // Collection name for School schema
          localField: 'studentDetails.schoolId', // Field in Student schema
          foreignField: '_id', // Field in School schema
          as: 'schoolDetails', // Output field for joined data
        },
      },
      {
        $unwind: {
          path: '$schoolDetails', // Flatten joined school data
          preserveNullAndEmptyArrays: true, // Keep student data even if no school match
        },
      },

      {
        $match: {
          enumeratorId: userID, // Replace with the registrar's ID or identifier
          lockStatus: false,
          ...(week && { attdWeek: Number(week) }), // Corrected from 'attWeek'
          ...(ward && { 'studentDetails.ward': ward }),
          ...(lgaOfEnrollment && {
            'studentDetails.lgaOfEnrollment': lgaOfEnrollment,
          }),
          ...(presentClass && { 'studentDetails.presentClass': presentClass }),
          ...(school && { 'studentDetails.schoolId': new ObjectId(school) }),
          ...(month && { month: Number(month) }),
          ...(year && { year: Number(year) }),
        },
      },

      {
        $project: {
          _id: 0, // Exclude MongoDB's `_id`
          year: 1,
          attdWeek: 1,
          month: 1,
          class: 1,
          studentRandomId: 1,
          AttendanceScore: 1,
          'studentDetails.surname': 1,
          'studentDetails.firstname': 1,
          'studentDetails.middlename': 1,
          'studentDetails.ward': 1,
          'studentDetails.lgaOfEnrollment': 1,
          'studentDetails.presentClass': 1,
          'studentDetails.state': 1,
          'studentDetails.accountNumber': 1,
          'studentDetails.bankName': 1,
          'schoolDetails.schoolName': 1,
          'schoolDetails._id': 1,
          'studentDetails.presentClass': 1,
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt in descending order
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }], // Count total documents
          data: [{ $skip: skip }, { $limit: limit }], // Paginate results
        },
      },
      {
        $unwind: '$metadata',
      },
      {
        $project: {
          total: '$metadata.total',
          data: 1,
        },
      },
    ])

    if (
      permissions.includes('handle_payments') ||
      permissions.includes('handle_registrars')
    ) {
      // const findStudent = await Student.find({ schoolId });
      // console.log('foundStudent', findStudent);
      attendance = await Attendance.aggregate([
        {
          $lookup: {
            from: 'students', // Collection name for Student schema
            localField: 'studentRandomId', // Field in Attendance
            foreignField: 'randomId', // Field in Student schema
            as: 'studentDetails', // Output field for joined data
          },
        },
        {
          $unwind: {
            path: '$studentDetails', // Flatten joined data
          },
        },
        {
          $lookup: {
            from: 'allschools', // Collection name for School schema
            localField: 'studentDetails.schoolId', // Field in Student schema
            foreignField: '_id', // Field in School schema
            as: 'schoolDetails', // Output field for joined data
          },
        },
        {
          $unwind: {
            path: '$schoolDetails', // Flatten joined school data
            preserveNullAndEmptyArrays: true, // Keep student data even if no school match
          },
        },

        {
          $group: {
            _id: {
              student: '$studentRandomId',
              month: '$month',
              year: '$year',
            }, // Group by student and month-year
            studentDetails: { $first: '$studentDetails' },
            schoolDetails: { $first: '$schoolDetails' },
            lockStatus: { $first: false },
            studentRandomId: { $first: '$studentRandomId' },
            createdAt: { $first: '$createdAt' },
            month: { $first: '$month' },
            year: { $first: '$year' },
            totalAttendanceScore: { $sum: '$AttendanceScore' }, // Sum attendance score for the month
            totalWeeks: { $sum: 1 }, // Count records (weeks)
          },
        },
        {
          $addFields: {
            totalPossibleMarks: { $multiply: ['$totalWeeks', 25] }, // Assuming 25 marks per week
            attendancePercentage: {
              $multiply: [
                {
                  $cond: [
                    { $eq: ['$totalPossibleMarks', 0] },
                    0,
                    {
                      $divide: ['$totalAttendanceScore', '$totalPossibleMarks'],
                    },
                  ],
                },
                100,
              ],
            },
            date: '$createdAt',
          },
        },
        {
          $match: {
            lockStatus: false,
            ...(month && { month: Number(month) }),
            ...(year && { year: Number(year) }),
            ...(ward && {
              'studentDetails.ward': { $regex: new RegExp(ward, 'i') },
            }),
            ...(lgaOfEnrollment && {
              'studentDetails.lgaOfEnrollment': {
                $regex: new RegExp(lgaOfEnrollment, 'i'),
              },
            }),
            ...(presentClass && {
              'studentDetails.presentClass': presentClass,
            }),
            ...(schoolId && {
              'studentDetails.schoolId': new ObjectId(schoolId),
            }),
            ...(percentage && {
              totalAttendanceScore: { $gte: parseInt(percentage) },
            }),
            ...(withBankDetails === true && {
              'studentDetails.bankName': { $nin: [null, ''] },
              'studentDetails.accountNumber': { $nin: [null, ''] },
            }),
            ...(withBankDetails === false && {
              'studentDetails.bankName': { $in: [null, ''] },
              'studentDetails.accountNumber': { $in: [null, ''] },
            }),
            ...(dateFrom || dateTo
              ? {
                  date: {
                    ...(dateFrom ? { $gte: new Date(dateFrom) } : {}),
                    ...(dateTo
                      ? {
                          $lte: new Date(
                            new Date(dateTo).setHours(23, 59, 59, 999)
                          ),
                        }
                      : {}),
                  },
                }
              : {}),
          },
        },

        {
          $project: {
            _id: 0, // Exclude MongoDB's `_id`
            date: 1,
            year: 1,
            month: 1,
            createdAt: 1,
            class: 1,
            studentRandomId: 1,
            AttendanceScore: 1,
            'studentDetails.surname': 1,
            'studentDetails.firstname': 1,
            'studentDetails.middlename': 1,
            'studentDetails.ward': 1,
            'studentDetails.lgaOfEnrollment': 1,
            'studentDetails.presentClass': 1,
            'studentDetails.state': 1,
            'studentDetails.accountNumber': 1,
            'studentDetails.bankName': 1,
            'schoolDetails.schoolName': 1,
            'schoolDetails._id': 1,
            'studentDetails.presentClass': 1,
            totalAttendanceScore: 1,
            totalWeeks: 1,
            totalPossibleMarks: 1,
            attendancePercentage: { $round: ['$attendancePercentage', 2] },
          },
        },
        {
          $sort: { createdAt: -1 }, // Sort by createdAt in descending order
        },
      ])
    }

    // console.log(Number(month), Number(year))
    if (attendance.length < 1) return next(new NotFoundError('No record found'))

    if (permissions.includes('handle_students') && permissions.length === 1) {
      return res.status(200).json({ attendance })
    } else {
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

      const aggregatedData = attendance.reduce((acc, curr) => {
        const {
          studentRandomId,
          totalAttendanceScore,
          month,
          year,
          studentDetails,
          schoolDetails,
          attendancePercentage,
        } = curr

        const key = `${studentRandomId}-${month}-${year}`
        if (!acc[key]) {
          acc[key] = {
            studentRandomId,
            month,
            year,
            totalAttendanceScore,
            attendancePercentage,
            surname: studentDetails.surname,
            firstname: studentDetails.firstname,
            ward: studentDetails.ward,
            lgaOfEnrollment: studentDetails.lgaOfEnrollment,
            presentClass: studentDetails.presentClass,
            bankName: studentDetails.bankName,
            accountNumber: studentDetails.accountNumber,
            schoolName: schoolDetails.schoolName,
          }
        }

        // acc[key].totalAttendanceScore += parseInt(AttendanceScore, 10); // Sum attendance scores
        return acc
      }, {})

      // console.log(attendance);

      const checkPaymentType = (paymentType) => {
        switch (paymentType) {
          case 'Registration':
            return { name: 'Registration', amount: 15000 }
          case 'Transition':
            return { name: 'Transition', amount: 25000 }
          case 'Registration and Transition':
            return { name: 'Registration and Transition', amount: 40000 }
          case 'Second Term':
            return { name: 'Second Term', amount: 10000 }
          case 'Third Term':
            return { name: 'Third Term', amount: 10000 }
          default:
            return null // Handle unexpected payment types
        }
      }

      const monthOptions = [
        { name: 'January', value: 1 },
        { name: 'February', value: 2 },
        { name: 'March', value: 3 },
        { name: 'April', value: 4 },
        { name: 'May', value: 5 },
        { name: 'June', value: 6 },
        { name: 'July', value: 7 },
        { name: 'August', value: 8 },
        { name: 'September', value: 9 },
        { name: 'October', value: 10 },
        { name: 'November', value: 11 },
        { name: 'December', value: 12 },
      ]

      const getMonthName = (inputedMonth) => {
        const monthValue = monthOptions.find(
          (month) => month.value === inputedMonth
        )
        return monthValue.name
      }

      const paymentDetails = checkPaymentType(paymentType)

      const toUpperCaseStrings = (obj) => {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key,
            key === 'StudentID'
              ? value
              : typeof value === 'string'
              ? value.toUpperCase()
              : value,
          ])
        )
      }

      const formattedData = Object.values(aggregatedData).map(
        (student, index) =>
          toUpperCaseStrings({
            'S/N': index + 1, // Add serial number starting from 1
            SchoolName: student.schoolName,
            StudentID: student.studentRandomId,
            Surname: student.surname,
            Firstname: student.firstname,
            Middlename: student.middlename || '', // Include middlename, default to empty string if missing
            Month: getMonthName(student.month),
            Year: student.year,
            TotalAttendanceScore: student.totalAttendanceScore,
            // AttendancePercentage: `${student.attendancePercentage}%`,
            Ward: student.ward,
            LGA: student.lgaOfEnrollment,
            Class: student.presentClass,
            BankName: student.bankName,
            AccountNumber: student.accountNumber,
            // paymentType: paymentDetails?.name || '',
            amount: '',
            status: '',
          })
      )

      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet([]) // Start with an empty worksheet

      // Add a custom heading that spans across columns
      const heading = [['Student Attendance Summary']]
      XLSX.utils.sheet_add_aoa(worksheet, heading, { origin: 'A1' })

      // Merge cells for the heading
      worksheet['!merges'] = [
        {
          s: { r: 0, c: 0 },
          e: { r: 0, c: Object.keys(formattedData[0]).length - 1 },
        }, // Merge heading across all columns
      ]

      // Add a blank row for spacing
      XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: 'A2' })

      // Add the actual data with headers starting from row 3
      XLSX.utils.sheet_add_json(worksheet, formattedData, {
        origin: 'A3',
        header: Object.keys(formattedData[0]),
      })

      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

      // Create a buffer for the Excel file
      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

      // Create a readable stream from the buffer
      const stream = Readable.from(buffer)

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename=students.xlsx`)
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )

      // Pipe the stream to the response
      stream.pipe(res)

      // Optional: Handle error during streaming
      stream.on('error', (err) => {
        console.error('Stream error:', err)
        res.status(500).send('Error generating file')
      })

      // End the response once the stream is finished
      stream.on('end', () => {
        console.log('File sent successfully')
        // Ensure the file exists before attempting deletion
        fs.unlink('../server/utils/uploads/students.xlsx', (err) => {
          if (err) {
            console.error('Error deleting file:', err)
          } else {
            console.log('File deleted successfully')
          }
        })
      })
    }
  } catch (err) {
    console.error(err)
    return next(err)
  }
}

export const importPaymentSheet = async (req, res, next) => {
  //   try {
  //     const { userID } = req.user
  //     const { month, year, paymentType } = req.body

  //     const paymentRecords = []
  //     const bulkOperations = []

  //           let student = await Student.find.lean();

  // student = student.find(student => {
  //   return req.parsedData.find(parsedStudent => parsedStudent.accountNumber === student.accountNumber)
  // })

  //     for (const row of req.parsedData) {
  //       const monthOptions = [
  //         { name: 'January', value: 1 },
  //         { name: 'February', value: 2 },
  //         { name: 'March', value: 3 },
  //         { name: 'April', value: 4 },
  //         { name: 'May', value: 5 },
  //         { name: 'June', value: 6 },
  //         { name: 'July', value: 7 },
  //         { name: 'August', value: 8 },
  //         { name: 'September', value: 9 },
  //         { name: 'October', value: 10 },
  //         { name: 'November', value: 11 },
  //         { name: 'December', value: 12 },
  //       ]

  //       const getMonthValue = (inputedMonth) => {
  //         const monthName = monthOptions.find(
  //           (month) => month.name.toUpperCase() === inputedMonth
  //         )
  //         return monthName.value
  //       }

  //       const accountNumber =
  //         String(row['Cust ID']).length === 8
  //           ? `00${row['Cust ID']}`
  //           : row['Cust ID'] || ''

  //       // Find matching student (lean for speed)

  //       // paymentRecords.push({
  //       //   studentRandomId: row.StudentID,
  //       //   class: row.Class,
  //       //   totalAttendanceScore: parseInt(row.TotalAttendanceScore) || 0,
  //       //   enumeratorId: userID,
  //       //   month: parseInt(row.Month),
  //       //   year,
  //       //   amount: row.amount || 0,
  //       //   firstname: row.Firstname,
  //       //   middlename: row.Middlename,
  //       //   surname: row.Surname,
  //       //   bankName: row.BankName,
  //       //   accountNumber: Number(row.AccountNumber),
  //       //   schoolName: row.SchoolName,
  //       //   ward: row.Ward,
  //       //   LGA: row.LGA,
  //       //   paymentStatus: row.status || 'not paid',
  //       // })

  //       // Prepare bulk update operations
  //       bulkOperations.push({
  //         updateOne: {
  //           filter: {
  //             // studentRandomId: row.StudentID,
  //             accountNumber,
  //             month: month,
  //             year: Number(year),
  //             paymentType,

  //             amount: Number(row.Amount),
  //           },
  //           update: {
  //             $set: {
  //               fullName: row?.Customer || '',
  //               amount: Number(row?.Amount) || 0,
  //               paymentDate: row['Date'],
  //               paymentType: paymentType,
  //               paymentStatus: row?.Status || 'Not paid',
  //               bankName: row?.BankName || '',
  //               accountNumber,
  //               firstname: student?.firstname || '',
  //               middlename: student?.middlename || '',
  //               surname: student?.surname || '',
  //               schoolId: student?.schoolId || '',
  //               LGA: student?.lgaOfEnrollment || '',
  //               presentClass: student?.presentClass || '',
  //               verificationStatus: student?.verificationStatus
  //                 ? 'Verified'
  //                 : 'Not Verifiied',
  //             },
  //           },
  //           upsert: true, // Insert if no matching document
  //         },
  //       })
  //     }

  //     if (bulkOperations.length > 0) {
  //       // Perform bulk write
  //       const result = await Payment.bulkWrite(bulkOperations)
  //       return res.status(200).json({
  //         message: `Payment records processed: new records for  ${result.upsertedCount} and modified for ${result.modifiedCount}`,
  //         insertedCount: result.upsertedCount,
  //         modifiedCount: result.modifiedCount,
  //       })
  //     } else {
  //       return res
  //         .status(400)
  //         .json({ message: 'No valid payment records to process.' })
  //     }
  //   }
  try {
    const { userID } = req.user
    const { month, year, paymentType } = req.body

    if (!req.parsedData || !req.parsedData.length) {
      return res.status(400).json({ message: 'No data found to process.' })
    }

    // 🔹 Step 1: Extract all account numbers
    const accountNumbers = req.parsedData.map((row) => {
      const custId = row['Cust ID']
      return String(custId).length === 8 ? `00${custId}` : String(custId)
    })

    // 🔹 Step 2: Fetch all students in a single query
    const students = await Student.find({
      accountNumber: { $in: accountNumbers },
    }).lean()

    // 🔹 Step 3: Create a lookup map for O(1) access
    const studentMap = new Map(students.map((s) => [s.accountNumber, s]))

    // 🔹 Step 4: Chunk the data to avoid overwhelming Mongo
    const chunkSize = 500
    let totalUpserts = 0
    let totalModified = 0

    for (let i = 0; i < req.parsedData.length; i += chunkSize) {
      const chunk = req.parsedData.slice(i, i + chunkSize)
      const bulkOps = []

      for (const row of chunk) {
        const accountNumber =
          String(row['Cust ID']).length === 8
            ? `00${row['Cust ID']}`
            : String(row['Cust ID']) || ''

        const student = studentMap.get(String(accountNumber)) || {}

        //  console.log(student)

        bulkOps.push({
          updateOne: {
            filter: {
              accountNumber,
              month: Number(month),
              year: Number(year),
              paymentType,
            },
            update: {
              $set: {
                fullName: row?.Customer || '',
                amount: Number(row?.Amount) || 0,
                paymentDate: row['Date'] || null,
                paymentType,
                paymentStatus: row?.Status || 'Not paid',
                bankName: row?.BankName || '',
                accountNumber,
                firstname: student?.firstname || '',
                middlename: student?.middlename || '',
                surname: student?.surname || '',
                schoolId: student?.schoolId || '',
                LGA: student?.lgaOfEnrollment || '',
                presentClass: student?.presentClass || '',
                month: Number(month),
                year: Number(year),
                verificationStatus: student?.verificationStatus || false,

                enumeratorId: userID,
              },
            },
            upsert: true,
          },
        })
      }

      if (bulkOps.length > 0) {
        const result = await Payment.bulkWrite(bulkOps, { ordered: false })
        totalUpserts += result.upsertedCount || 0
        totalModified += result.modifiedCount || 0
        console.log(
          `Processed chunk ${i / chunkSize + 1}: inserted ${
            result.upsertedCount
          }, modified ${result.modifiedCount}`
        )
      }
    }

    return res.status(200).json({
      message: `Payment records processed: new records for  ${totalUpserts} and modified for ${totalModified}`,
    })
  } catch (error) {
    return next(error)
  }
}

export const createStudent = async (req, res, next) => {
  try {
    // await Student.deleteMany({});
    const randomId = generateStudentsRandomId()
    const uploadedImage = req.uploadedImage
    if (!uploadedImage) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'No uploaded image found' })
    }
    const { secure_url } = uploadedImage
    const { userID } = req.user
    // const optional = req.body.ward || "others"
    const { accountNumber } = req.body

    const isExistingAccountNumber = await Student.findOne({ accountNumber })
    if (isExistingAccountNumber && accountNumber !== '')
      return next(
        new BadRequestError(`Account Number ${accountNumber} already exists`)
      )
    const student = new Student({
      ...req.body,
      createdBy: userID,
      passport: secure_url,
      randomId: randomId,
      src: 'Web',
    })
    await student.save()

    const sessionData = req.session

    addLogToUser(
      Registrar,
      userID,
      `Enumerator Created student with id: ${student._id}`,
      req.ip,
      {
        sessionId: sessionData.id || 'unknown',
        sessionCreated: sessionData.cookie._expires,
        data: sessionData, // Add any relevant session details
      }
    )

    res.status(StatusCodes.OK).json({ student })
  } catch (error) {
    return next(error)
  }
}

export const deleteStudent = async (req, res, next) => {
  let session
  try {
    session = await mongoose.startSession()
    session.startTransaction()

    const { id } = req.params

    // Find the student within the session
    const student = await Student.findOne({ randomId: id }).session(session)

    if (!student) {
      await session.abortTransaction()
      session.endSession()
      return next(new NotFoundError(`There is no student with id: ${id}`))
    }

    const studentObj = student.toObject()

    // Save to recycle bin within the same transaction
    await DeletedStudents.create([{ ...studentObj, deletedAt: new Date() }], {
      session,
    })

    // Delete the student within the same transaction
    const deletedStudent = await Student.findOneAndDelete({
      randomId: id,
    }).session(session)

    if (!deletedStudent) {
      throw new Error('An error occurred while trying to delete student')
    }

    await session.commitTransaction()
    session.endSession()

    console.log('Student deleted and moved to recycle bin')
    res.status(StatusCodes.OK).json({ message: 'Student deleted successfully' })
  } catch (error) {
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    next(error)
  }
}

export const deleteManyStudents = async (req, res, next) => {
  let session
  try {
    session = await mongoose.startSession()
    session.startTransaction()

    const { ids } = req.query
    const selectedStudents = ids?.split(',').map((id) => id.trim())

    if (!selectedStudents?.length) {
      await session.abortTransaction()
      session.endSession()
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'No students selected for deletion.' })
    }

    const students = await Student.find(
      { randomId: { $in: selectedStudents } },
      null,
      { session }
    )

    if (!students.length) {
      await session.abortTransaction()
      session.endSession()
      return next(new NotFoundError('No matching students found.'))
    }

    const recycleBinData = students.map((student) => ({
      ...student.toObject(),
      deletedAt: new Date(),
    }))

    // Insert into DeletedStudents (within the same transaction)
    await DeletedStudents.insertMany(recycleBinData, { session })

    // Delete from Students collection
    const deletedStudents = await Student.deleteMany(
      { randomId: { $in: selectedStudents } },
      { session }
    )

    if (deletedStudents.deletedCount === 0) {
      await session.abortTransaction()
      session.endSession()
      return next(new Error('No students were deleted.'))
    }

    // Commit if everything succeeded
    await session.commitTransaction()
    session.endSession()

    res.status(StatusCodes.OK).json({
      message: `${deletedStudents.deletedCount} students moved to recycle bin successfully.`,
    })
  } catch (error) {
    // Roll back in case of error
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    next(error)
  }
}

export const restoreSelectedStudents = async (req, res, next) => {
  let session
  try {
    session = await mongoose.startSession()
    session.startTransaction()
    
    const { ids } = req.query
    const selectedStudents = ids?.split(',').map((id) => id.trim())
    console.log(selectedStudents)

    if (!selectedStudents?.length) {
      await session.abortTransaction()
      session.endSession()
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'No students selected for deletion.' })
    }

    const students = await DeletedStudents.find(
      { randomId: { $in: selectedStudents } },
      null,
      { session }
    )



    if (!students.length) {
      await session.abortTransaction()
      session.endSession()
      return next(new NotFoundError('No matching students found.'))
    }

    const recycleBinData = students.map((student) => ({
      ...student.toObject(),
      deletedAt: new Date(),
    }))

// console.log(recycleBinData)
    // Insert into DeletedStudents (within the same transaction)
    await Student.insertMany(recycleBinData, { session })

    // Delete from Students collection
    const deletedStudents = await DeletedStudents.deleteMany(
      { randomId: { $in: selectedStudents } },
      { session }
    )

    if (deletedStudents.deletedCount === 0) {
      await session.abortTransaction()
      session.endSession()
      return next(new Error('No students were deleted.'))
    }

    // Commit if everything succeeded
    await session.commitTransaction()
    session.endSession()

    res.status(StatusCodes.OK).json({
      message: `${deletedStudents.deletedCount} students restored successfully.`,
    })
  } catch (error) {
    // Roll back in case of error
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    next(error)
  }
}

export const studentRecycleBinData = async (req, res, next) => {
  try {
    const students = await DeletedStudents.find().populate('schoolId').lean()

    // console.log(students)
    res.status(StatusCodes.OK).json({ data: students })
  } catch (err) {
    return next(err)
  }
}

export const updateStudent = async (req, res, next) => {
  const { id } = req.params

  try {
    const student = await Student.findById({ _id: id })
    if (!student) {
      return next(new NotFoundError('There is no student with id: ' + id)) // Ensure early return
    }

    // const registrationTime = new Date(student.createdAt);
    // const currentTime = new Date();
    // const timeDifference = (currentTime - registrationTime) / (1000 * 60 * 60); // Calculate time difference in hours
    // console.log("Time Difference (hours):", timeDifference);

    // if (timeDifference >= 5) {
    //     console.log("Time difference exceeded, rejecting update...");
    //     return next(
    //         new BadRequestError('Students can only be updated within the first 5 hours of registration')
    //     ); // Ensure early return
    // }

    let updatedStudent
    if (req.file && req.uploadedImage) {
      const { secure_url } = req.uploadedImage

      // console.log(secure_url)

      updatedStudent = await Student.findByIdAndUpdate(
        { _id: id },
        { ...req.body, passport: secure_url },
        { new: true, runValidators: true }
      )
    } else {
      updatedStudent = await Student.findByIdAndUpdate(
        { _id: id },
        { ...req.body },
        { new: true, runValidators: true }
      )
    }

     res.status(StatusCodes.OK).json({ updatedStudent }) // Ensure response is sent only once
  } catch (error) {
    console.error('Error occurred:', error)
    return next(error) // Pass errors to the error handler
  }
}

export const getDuplicateRecord = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $addFields: {
          schoolId: { $toObjectId: '$schoolId' },
          surnameLower: { $toLower: '$surname' },
          firstnameLower: { $toLower: '$firstname' },
          lgaLower: { $toLower: '$lgaofEnrollment' },
        },
      },
      {
        $lookup: {
          from: 'allschools',
          localField: 'schoolId',
          foreignField: '_id',
          as: 'schoolDetails',
        },
      },
      {
        $addFields: {
          schoolName: { $arrayElemAt: ['$schoolDetails.schoolName', 0] },
        },
      },
      {
        $group: {
          _id: {
            surname: '$surnameLower',
            firstname: '$firstnameLower',
            lgaofEnrollment: '$lgaLower',
            schoolId: '$schoolId',
          },
          similarRecords: {
            $push: {
              randomId: '$randomId',
              surname: '$surname', // original case
              firstname: '$firstname',
              middlename: '$middlename',
              parentPhone: '$parentPhone',
              presentClass: '$presentClass',
              schoolId: '$schoolId',
              schoolName: '$schoolName',
              lgaOfEnrollment: '$lgaOfEnrollment', // original case
              passport: '$passport',
              verificationStatus: '$verificationStatus',
              cohort: '$cohort',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
      {
        $project: {
          'similarRecords.schoolDetails': 0,
        },
      },
    ]

    const duplicates = await Student.aggregate(pipeline)
    const students = duplicates

    return res.status(200).json({ students })
  } catch (err) {
    console.log(err)
    return next(err)
  }

  // try {

  //     const {
  //         surname,
  //         firstname,
  //         middlename,
  //         lgaOfEnrollment,
  //         schoolId,
  //         presentClass,
  //         parentPhone,
  //     } = req.query;

  //     if ((!surname && !firstname && !middlename) && (!lgaOfEnrollment && !schoolId && !presentClass && !parentPhone)) return next(new BadRequestError('Please Apply at least one filter to avoid pulling unneccessary large data from the DB'))
  //     // Build the query object with $regex for partial matching
  //     const query = {};

  //     if (surname) query.surname = { $regex: surname, $options: "i" };
  //     if (firstname) query.firstname = { $regex: firstname, $options: "i" };
  //     if (middlename) query.middlename = { $regex: middlename, $options: "i" };
  //     if (lgaOfEnrollment) query.lgaOfEnrollment = lgaOfEnrollment;
  //     if (schoolId) query.schoolId = new mongoose.Types.ObjectId(schoolId);
  //     if (presentClass) query.presentClass = { $regex: presentClass, $options: "i" };
  //     if (parentPhone) query.parentPhone = { $regex: parentPhone, $options: "i" };

  //     // Query the database
  //     console.log(query);
  //     const students = await Student.find(query).populate('schoolId');
  //     if (!students) return next(new BadRequestError("An error occured, getting duplicate data, please try again!!! "))

  //     return res.status(200).json({ students });
  // } catch (err) {
  //     return next(err);
  // }
}

export const toggleStudentActiveStatus = async (req, res, next) => {
  // const { studentRandomId } = req.query;
  // const studentExist = await Student.findOne({ randomId: studentRamdonId });
  // if (!studentExist) return next(new NotFoundError('No Student found with the id: ' + studentRandomId));
  // studentExist.isActive = !studentExist.isActive;
  // const notPromotedStudent = await Student.save();
  // if (notPromotedStudent) return next(new BadRequestError('An error occured during the operation'));
  // const currentStatusMessage = studentExist.isActive === true ? `made ineligible` : 'made eligible';
  // res.status(200).json({ message: `${studentExist.surname} ${studentExist.firstname} has been ${currentStatusMessage}` });
}

export const promoteSingleStudent = async (req, res, next) => {
  try {
    const { studentRandomId } = req.body
    const studentExist = await Student.findOne({ randomId: studentRandomId })
    if (!studentExist) {
      return next(
        new NotFoundError('No student found with the ID: ' + studentRandomId)
      )
    }
    // const studentInAttendance = await Attendance.findOne({studentRandomId: studentExist.randomId})

    switch (studentExist.presentClass) {
      case 'Primary 6':
        studentExist.presentClass = 'JSS 1'
        studentExist.isActive = true
        // studentInAttendance.lockStatus = true;
        break
      case 'JSS 1':
        studentExist.presentClass = 'JSS 2'
        studentExist.isActive = false
        // studentInAttendance.lockStatus = true;

        break
      case 'JSS 2':
        studentExist.presentClass = 'JSS 3'
        studentExist.isActive = true
        // studentInAttendance.lockStatus = false;
        break
      case 'JSS 3':
        studentExist.presentClass = 'SSS 1'
        studentExist.isActive = true
        // studentInAttendance.lockStatus = false;
        break
      case 'SSS 1':
        studentExist.presentClass = 'SSS 2'
        studentExist.isActive = false
        // studentInAttendance.lockStatus = true;
        break
      default:
        return next(new BadRequestError('Invalid class for promotion'))
    }

    await studentExist.save()

    const statusMessage = studentExist.isActive
      ? 'made eligible'
      : 'made ineligible'
    res.status(200).json({
      message: `${studentExist.surname} ${studentExist.firstname} has been promoted to ${studentExist.presentClass} and is ${statusMessage}`,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
export const demoteSingleStudent = async (req, res, next) => {
  try {
    const { studentRandomId } = req.body
    const studentExist = await Student.findOne({ randomId: studentRandomId })

    if (!studentExist) {
      return next(
        new NotFoundError('No student found with the ID: ' + studentRandomId)
      )
    }
    // const studentInAttendance = await Attendance.findOne({studentRandomId: studentExist.randomId})
    // if(!studentInAttendance)
    // console.log(studentInAttendance)
    switch (studentExist.presentClass) {
      case 'JSS 1':
        studentExist.presentClass = 'Primary 6'
        studentExist.isActive = true
        // studentInAttendance.lockStatus = false;

        break
      case 'JSS 2':
        studentExist.presentClass = 'JSS 1'
        studentExist.isActive = true
        // studentInAttendance.lockStatus = false;

        break
      case 'JSS 3':
        studentExist.presentClass = 'JSS 2'
        studentExist.isActive = false
        // studentInAttendance.lockStatus = true;

        break
      case 'JSS 3':
        studentExist.presentClass = 'SSS 1'
        studentExist.isActive = true
        // studentInAttendance.lockStatus = false;
        break
      case 'SSS 1':
        studentExist.presentClass = 'JSS 3'
        studentExist.isActive = true
        // studentInAttendance.lockStatus = false;

        break
      case 'SSS 2':
        studentExist.presentClass = 'SSS 1'
        studentExist.isActive = false
        // studentInAttendance.lockStatus = true;
        break
      default:
        return next(new BadRequestError('Invalid class for demotion'))
    }

    await studentExist.save()

    const statusMessage = studentExist.isActive
      ? 'made eligible'
      : 'made ineligible'
    res.status(200).json({
      message: `${studentExist.surname} ${studentExist.firstname} has been demoted to ${studentExist.presentClass}`,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const promotePlentyStudents = async (req, res, next) => {
  try {
    const { presentClass } = req.body

    if (!presentClass) {
      return next(new BadRequestError('Invalid class selected for promotion'))
    }
    // console.log(presentClass)
    let promotedClass = null

    switch (presentClass.toUpperCase()) {
      case 'PRIMARY 6':
        promotedClass = await Student.updateMany(
          { presentClass: 'Primary 6' },
          { presentClass: 'JSS 1', isActive: true },
          { runValidators: true }
        )
        res.status(200).json({
          message: `All Primary 6 students have been promoted to JSS 1`,
        })
        break

      case 'JSS 1':
        promotedClass = await Student.updateMany(
          {
            presentClass: {
              $in: ['JSS 1', 'Jss 1'],
            },
          },
          { presentClass: 'JSS 2', isActive: false },
          { runValidators: true }
        )
        res
          .status(200)
          .json({ message: `All JSS 1 students have been promoted to JSS 2` })
        break

      case 'JSS 2':
        promotedClass = await Student.updateMany(
          {
            presentClass: {
              $in: ['JSS 2', 'Jss 2'],
            },
          },
          { presentClass: 'JSS 3', isActive: true },
          { runValidators: true }
        )
        res
          .status(200)
          .json({ message: `All JSS 2 students have been promoted to JSS 3` })
        break

      case 'JSS 3':
        promotedClass = await Student.updateMany(
          {
            presentClass: {
              $in: ['JSS 3', 'Jss 3'],
            },
          },
          { presentClass: 'SSS 1', isActive: true },
          { runValidators: true }
        )
        res
          .status(200)
          .json({ message: `All JSS 3 students have been promoted to SSS 1` })
        break

      case 'SSS 1':
        promotedClass = await Student.updateMany(
          {
            presentClass: {
              $in: ['SSS 1', 'Sss 1'],
            },
          },
          { presentClass: 'SSS 2', isActive: false },
          { runValidators: true }
        )
        res
          .status(200)
          .json({ message: `All SSS 1 students have been promoted to SSS 2` })
        break

      default:
        return next(new BadRequestError('Invalid class for promotion.'))
    }
  } catch (error) {
    console.error(error)
    return next(error)
  }
}

export const demotePlentyStudents = async (req, res, next) => {
  try {
    const { presentClass } = req.body
    // console.log(presentClass)
    if (!presentClass) {
      return next(new BadRequestError('Invalid class selected for promotion'))
    }

    let promotedClass = null

    switch (presentClass.toUpperCase()) {
      case 'JSS 1':
        promotedClass = await Student.updateMany(
          { presentClass: 'JSS 1' },
          { presentClass: 'Primary 6', isActive: true },
          { runValidators: true }
        )
        res.status(200).json({
          message: `All JSS 1 students have been demoted to Primary 6`,
        })
        break

      case 'JSS 2':
        promotedClass = await Student.updateMany(
          {
            presentClass: {
              $in: ['JSS 2', 'Jss 2'],
            },
          },
          { presentClass: 'JSS 1', isActive: true },
          { runValidators: true }
        )
        res
          .status(200)
          .json({ message: `All JSS 2 students have been demoted to JSS 1` })
        break

      case 'JSS 3':
        promotedClass = await Student.updateMany(
          {
            presentClass: {
              $in: ['JSS 3', 'Jss 3'],
            },
          },
          { presentClass: 'JSS 2', isActive: false },
          { runValidators: true }
        )
        res
          .status(200)
          .json({ message: `All JSS 3 students have been demoted to JSS 2` })
        break

      case 'SSS 1':
        promotedClass = await Student.updateMany(
          {
            presentClass: {
              $in: ['SSS 1', 'Sss 1'],
            },
          },
          { presentClass: 'JSS 3', isActive: true },
          { runValidators: true }
        )
        res
          .status(200)
          .json({ message: `All SSS 1 students have been demoted to JSS 3` })
        break

      case 'SSS 2':
        promotedClass = await Student.updateMany(
          {
            presentClass: {
              $in: ['SSS 2', 'Sss 2'],
            },
          },
          { presentClass: 'SSS 1', isActive: true },
          { runValidators: true }
        )
        res
          .status(200)
          .json({ message: `All SSS 2 students have been demoted to SSS 1` })
        break

      default:
        return next(new BadRequestError('Invalid class for promotion.'))
    }
  } catch (error) {
    console.error(error)
    return next(error)
  }
}

export const updateStudentsBankAccountDetails = async (req, res, next) => {
  try {
    const updateStudentsAccount = async () => {
      try {
        // console.log(req.parsedData)

        const operations = req.parsedData.map((student) => {
          return {
            updateOne: {
              filter: { randomId: student.STUDENTID?.toString()?.trim() },
              update: {
                $set: {
                  accountNumber:
                    student['ACTUAL ACCOUNT OPENNED'] ||
                    student['ACTUALACCOUNTOPENNED'],
                  bankName: student['BANK NAME']?.trim() || student['BANKNAME'],
                  NUBAN: student['NUBAN'],
                  parentPhone:
                    student['PARENTPHONE'] || student['PARENT PHONE'],
                },
              },
            },
          }
        })

        const result = await Student.bulkWrite(operations)
        console.log(result)
        const studentIdsFromExcel = req.parsedData.map((student) =>
          student.STUDENTID?.toString()?.trim()
        )

        // Fetch all matching students from DB
        const foundStudents = await Student.find({
          randomId: { $in: studentIdsFromExcel },
        }).select('randomId')

        // Convert DB IDs into a Set for faster lookup
        const foundIdsSet = new Set(foundStudents.map((s) => s.randomId))

        // Filter the missing ones

        const unmatchedStudents = req.parsedData.filter((student) => {
          const id =
            student.STUDENTID != null ? student.STUDENTID.toString().trim() : []
          return !foundIdsSet.has(id)
        })

        let unmatchedStudentsArray = unmatchedStudents.map((s) => s.STUDENTID)

        if (unmatchedStudentsArray.includes(undefined)) {
          unmatchedStudentsArray = null
        }

        // ! check unmatrched studetns array if the elements there are defined, if not just return null

        // ! check duplicates
        console.log(unmatchedStudentsArray)

        // const ids = req.parsedData.map((s) => s.STUDENTID?.trim?()).filter(Boolean)
        // const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
        // console.log('Duplicates:', duplicates)

        // console.log('Unmatched students:', unmatchedStudents.length)
        // console.log(unmatchedStudents.map((s) => s.STUDENTID))

        res.status(200).json({
          message: 'Students informations updated successfully!!!',
          matched: result.matchedCount,
          modified: result.modifiedCount,
          unmatchedStudents: unmatchedStudentsArray,
        })
      } catch (error) {
        console.error('Error updating students:', error)
        res.status(500).json({ message: 'Failed to update students' })
      }
    }

    updateStudentsAccount()
  } catch (err) {
    return next(err)
  }
}

export const EditManyStudents = async (req, res, next) => {
  try {
    const { ids } = req.query // Access the query parameter
    if (!ids)
      return next(new BadRequestError('Bad reqest, please select students'))
    const selectedStudents = ids.split(',') // Convert to array
    const { presentClass } = req.body.formData
    const basket = {}
    if (!req.body.formData.presentClass && !req.body.formData.schoolId)
      return next(
        new BadRequestError('Please select at least one field to update')
      )
    if (req.body.formData.schoolId) {
      basket.schoolId = req.body.formData.schoolId
    }
    if (req.body.formData.presentClass) {
      basket.presentClass = req.body.formData.presentClass
    }
    // console.log(basket, selectedStudents);

    if (!selectedStudents || !selectedStudents.length) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'No students selected for deletion.' })
    }
    // console.log(selectedStudents, req.body)
    const updateManyStudents = await Student.updateMany(
      {
        randomId: { $in: selectedStudents },
      },
      {
        $set: basket,
      }
    )

    // console.log(updateManyStudents)

    if (updateManyStudents.modifiedCount === 0) {
      return next(new NotFoundError('No student updated.'))
    }
    // console.log(updateManyStudents);
    res.status(StatusCodes.OK).json({
      message: `${updateManyStudents.modifiedCount} students updated successfully.`,
    })
  } catch (error) {
    return next(error)
  }
}

export const SyncStudentsVerification = async (req, res, next) => {
  // console.log('got in here')
  try {
    const studentsWithVerification = await Verification.find({})
    const studentsIdWithVerification = studentsWithVerification.map(
      (student) => student.studentId
    )

    await Student.updateMany(
      {
        _id: { $in: studentsIdWithVerification },
      },
      {
        $set: {
          verificationStatus: true,
        },
      }
    )

    res
      .status(200)
      .json({ message: 'Student Verification synced successfully' })
  } catch (error) {
    return next(error)
  }
}

export const getSchoolsByStudentsRegistered = async (req, res, next) => {
  try {
    const schoolsByStudents = await Student.aggregate([
      {
        $group: {
          _id: '$schoolId',
          schoolByStudentCount: {
            $sum: 1,
          },
        },
      },
    ])

    res.status(200).json({ data: schoolsByStudents })
  } catch (error) {
    return next(error)
  }
}
export const getLgasByStudentsRegistered = async (req, res, next) => {
  try {
    const lgasByStudents = await Student.aggregate([
      {
        $group: {
          _id: '$lgaOfEnrollment',
          lgaByStudentCount: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0, // remove the ugly _id field
          lgaOfEnrollment: '$_id',
          lgaByStudentCount: '$lgaByStudentCount',
        },
      },
    ])

    res.status(200).json({ data: lgasByStudents })
  } catch (error) {
    return next(error)
  }
}
export const UpdateParentRelationship = async (req, res, next) => {
  try {
    const updateStudentsAccount = async () => {
      try {
        // console.log(req.parsedData)

        const operations = req.parsedData.map((student) => {
          return {
            updateOne: {
              filter: { randomId: student.RANDOMID?.toString()?.trim() },
              update: {
                $set: {
                  parentRelationship:
                    student['RELATIONSHIP WITH STUDENT'] ||
                    student['Relationship with Student'],
                },
              },
              upsert: true
            },
          }
        })

        // console.log('operations', operations)

        const result = await Student.bulkWrite(operations)
        console.log(result)
        const studentIdsFromExcel = req.parsedData.map((student) =>
          student.RANDOMID?.toString()?.trim()
        )

        // Fetch all matching students from DB
        const foundStudents = await Student.find({
          randomId: { $in: studentIdsFromExcel },
        }).select('randomId')

        // Convert DB IDs into a Set for faster lookup
        const foundIdsSet = new Set(foundStudents.map((s) => s.randomId))

        // Filter the missing ones

        const unmatchedStudents = req.parsedData.filter((student) => {
          const id =
            student.RANDOMID != null ? student.RANDOMID.toString().trim() : []
          return !foundIdsSet.has(id)
        })

        let unmatchedStudentsArray = unmatchedStudents.map((s) => s.RANDOMID)

        if (unmatchedStudentsArray.includes(undefined)) {
          unmatchedStudentsArray = null
        }

        // ! check unmatrched studetns array if the elements there are defined, if not just return null

        // ! check duplicates
        // console.log(unmatchedStudentsArray)

        // const ids = req.parsedData.map((s) => s.STUDENTID?.trim?()).filter(Boolean)
        // const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
        // console.log('Duplicates:', duplicates)

        // console.log('Unmatched students:', unmatchedStudents.length)
        // console.log(unmatchedStudents.map((s) => s.STUDENTID))

        res.status(200).json({
          message: 'Students informations updated successfully!!!',
          matched: result.matchedCount,
          modified: result.modifiedCount,
          unmatchedStudents: unmatchedStudentsArray,
        })
      } catch (error) {
        console.error('Error updating students:', error)
        res.status(500).json({ message: 'Failed to update students' })
      }
    }

    updateStudentsAccount()
  } catch (err) {
    return next(err)
  }
}


