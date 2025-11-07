import { getDefaultResultOrder } from 'dns'
import { Attendance } from '../models/attendanceSchema.js'
import { Payment, Student } from '../models/index.js'
import mongoose from 'mongoose'

export const getTotalAmountPaid = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear() // Get the current year dynamically
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00Z`)
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59Z`)

    // console.log('entered here')
    const totalAmount = await Payment.aggregate([
      // {
      //   $match: {
      //     paymentStatus: 'Complete', // Filtering only completed payments
      //     paymentDate: {
      //       $gte: startOfYear,
      //       $lte: endOfYear,
      //     }, // Filtering payments within the current year
      //   },
      // },
      {
        $group: {
          _id: null, // Grouping by no specific field to get the total sum
          totalAmountDisbursed: { $sum: '$amount' }, // Summing up the amounts
        },
      },
      {
        $project: {
          _id: 0, // Remove _id field from the output
          totalAmountDisbursed: 1, // Returning the total amount
        },
      },
    ])

    res
      .status(200)
      .json({ totalAmountDisbursed: totalAmount[0].totalAmountDisbursed })
  } catch (error) {
    console.error('Error fetching total amount paid:', error)
    res.status(500).json({ message: 'Error fetching total amount paid' })
  }
}

export const getLGAWithTotalPayments = async (req, res, next) => {
  try {
    const lgaWithTotalPayments = await Payment.aggregate([
      {
        $lookup: {
          from: 'students', // The collection to join
          localField: 'studentId', // The field in Payment schema
          foreignField: '_id', // The field in Student schema
          as: 'studentInfo', // Alias for joined documents
        },
      },
      {
        $unwind: '$studentInfo', // Unwind the studentInfo array if needed
      },
      {
        $group: {
          _id: '$studentInfo.lgaOfEnrollment', // Group by LGA of enrollment
          totalAmountPaid: { $sum: '$amount' }, // Sum up the payment amounts
        },
      },
      {
        $project: {
          lgaOfEnrollment: '$_id', // Returning the grouped LGA as field name
          totalAmountPaid: 1, // Include the total payment sum
          _id: 0, // Exclude the default _id field from the output
        },
      },
    ])
    // lgaWithTotalPayments
    res.status(200).json({ message: 'sent', lgaWithTotalPayments })
  } catch (error) {
    console.error('Error fetching LGA with total payments:', error)
    return next(error)
  }
}

export const viewPayments = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      year,
      month,
      paymentStatus,
      LGA,
      ward,
      schoolId,
      totalAttendanceScore,
      bankName,
      presentClass,
      amount,
      paymentType,
      dateFrom,
      dateTo,
      download,
    } = req.query

    // Build the match stage with filters
    const matchStage = {}
    if (year) matchStage.year = parseInt(year) // Filter by year
    if (month) matchStage.month = parseInt(month) // Filter by month
    if (paymentStatus) matchStage.paymentStatus = paymentStatus // Filter by payment status
    if (totalAttendanceScore)
      matchStage.totalAttendanceScore = parseInt(totalAttendanceScore) // Filter by total attendance score
    if (bankName) matchStage.bankName = bankName // Filter by bank name
    if (paymentType) matchStage.paymentType = paymentType // Filter by payment type
    if (LGA) matchStage.LGA = LGA // Filter by LGA
    if (ward) matchStage.ward = ward // Filter by ward
    if (schoolId && mongoose.Types.ObjectId.isValid(schoolId)) {
      matchStage.schoolId = new mongoose.Types.ObjectId(schoolId)
    }
    if (presentClass) matchStage.presentClass = presentClass // Filter by class
    if (amount) matchStage.amount = parseInt(amount) // Filter by amount
    // Handle date range filters
    if (dateFrom || dateTo) {
      matchStage.createdAt = {}
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        if (isNaN(fromDate)) {
          return next(new BadRequestError('Invalid dateFrom format'))
        }
        matchStage.createdAt.$gte = fromDate
      }
      if (dateTo) {
        const toDate = new Date(new Date(dateTo).setHours(23, 59, 59, 999))
        if (isNaN(toDate)) {
          return next(new BadRequestError('Invalid dateTo format'))
        }
        matchStage.createdAt.$lte = toDate
      }
    }

    const pageNumber = parseInt(page, 10) || 1
    const limitNumber = parseInt(limit, 10) || 200

    let pipeline
    console.log(matchStage)
    // Build the aggregation pipeline
    if (download) {
      pipeline = [
        { $match: matchStage },

        // Join school name from School collection (optional if you have that collection)
        {
          $lookup: {
            from: 'allschools',
            localField: 'schoolId',
            foreignField: '_id',
            as: 'schoolInfo',
          },
        },
        {
          $unwind: {
            path: '$schoolInfo',
            preserveNullAndEmptyArrays: true, // keep records even if no school found
          },
        },

        // Sort before numbering
        {
          $sort: { createdAt: -1 },
        },

        // Add serial number
        {
          $setWindowFields: {
            sortBy: { createdAt: 1 },
            output: {
              serialNumber: { $documentNumber: {} },
            },
          },
        },

        // Reorder and rename fields for export
        {
          $project: {
            _id: 0,
            'Serial No': '$serialNumber',
            'School Name': '$schoolInfo.schoolName',
            'LGA of Enrollment': '$LGA',
            Surname: '$surname',
            Firstname: '$firstname',
            Middlename: '$middlename',
            'Present Class': '$presentClass',
            'Account Number': '$accountNumber',
            'Amount Paid': '$amount',
            'Payment Type': '$paymentType',
            'Payment Status': '$paymentStatus',
            'Verification Status': '$verificationStatus',
          },
        },
      ]
    } else {
      pipeline = [
        { $match: matchStage }, // Match stage
        {
          $project: {
            __v: 0, // Exclude __v
            _id: 0, // Exclude _id
            lockStatus: 0, // Exclude lockStatus
            date: 0, // Exclude date
            updatedAt: 0, // Exclude updatedAt
          },
        },
        {
          $sort: { createdAt: -1 }, // Sort by createdAt in descending order (optional)
        },
        {
          $facet: {
            totalAmount: [
              {
                $group: {
                  _id: null,
                  totalAmount: { $sum: { $toDouble: '$amount' } }, // Convert string to number for aggregation
                },
              },
            ],
            metadata: [
              { $count: 'totalPayments' }, // Count total records
            ],
            data: [
              { $skip: (pageNumber - 1) * limitNumber }, // Skip for pagination
              { $limit: limitNumber }, // Limit for pagination
            ],
          },
        },
      ]
    }

    const result = await Payment.aggregate(pipeline).collation({
      locale: 'en',
      strength: 2,
    })

    // console.log(result)

    let metadata
    let data
    let amountSum

    if (download) {
      data = result
    } else {
      metadata = result[0]?.metadata[0] || { totalPayments: 0 }
      data = result[0]?.data || []
      amountSum = result[0]?.totalAmount || 0
    }

    return res.status(200).json({
      getAllPaymentsRecords: data,
      totalPayments: download ? null : metadata.totalPayments,
      amountSum: download ? null : amountSum,
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return res
      .status(500)
      .json({ message: 'An error occurred while fetching payments' })
  }
}

export const getTotalStudentsPaidMonthly = async (req, res, next) => {
  try {
    const getCurrentMonth = () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1) // First day of the current month
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0) // Last day of the current month
      return { startOfMonth, endOfMonth }
    }

    const { startOfMonth, endOfMonth } = getCurrentMonth()

    const totalStudents = await Payment.aggregate([
      {
        $match: {
          paymentStatus: 'Completed', // Only include completed payments
          paymentDate: {
            $gte: startOfMonth, // Payments made on or after the start of the month
            $lte: endOfMonth, // Payments made on or before the end of the month
          },
        },
      },
      {
        $group: {
          _id: '$studentId', // Group by studentId to count unique students
        },
      },
      {
        $count: 'totalStudentsPaid', // Count the number of unique student IDs
      },
    ])

    res.status(200).json({
      message: 'Total students who paid for the current month',
      totalStudentsPaid: totalStudents[0]?.totalStudentsPaid || 0, // Handle cases with no payments
    })
  } catch (error) {
    console.error('Error fetching total students paid:', error)
    res.status(500).json({ message: 'Error fetching data' })
  }
}

export const getPaymentsByLGA = async (req, res, next) => {
console.log('got in here')
  try {
    const pipeline = [
      // { $limit: 10 },
      {
        $lookup: {
          from: 'students',
          localField: 'accountNumber',
          foreignField: 'accountNumber',
          as: 'studentDetails',
        },
      },
      {
        $unwind: {
          path: '$studentDetails',
          preserveNullAndEmptyArrays: false, // skip payments without students
        },
      },
      {
        $addFields: {
          amountAsNumber: {
            $convert: {
              input: '$amount',
              to: 'double',
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: { $toLower: '$studentDetails.lgaOfEnrollment' },
          totalAmount: { $sum: '$amountAsNumber' },
        },
      },
      {
        $project: {
          _id: 0,
          LGA: '$_id',
          totalAmount: 1,
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]

    const paymentByLGA = await Payment.aggregate(pipeline)
    // console.log('done aggregation:', paymentByLGA)
    res.status(200).json({ paymentByLGA })
  } catch (error) {
    console.error('Error fetching payments by LGA:', error)
    return next(error)
  }
}
export const getTotalStudentPaid = async (req, res, next) => {
  try {
    // const pipeline = [
    //   {
    //     $lookup: {
    //       from: 'students', // collection name
    //       localField: 'accountNumber',
    //       foreignField: 'accountNumber',
    //       as: 'studentDetails',
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$studentDetails',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: '$studentDetails._id', // Group by LGA
    //     },
    //   },
    // ]

    const pipeline = [
      {
        $group: {
          _id: '$accountNumber',
          totalStudentPaid: {
            $sum: 1,
          },
        },
      },
    ]

    const totalStudentPaid = await Payment.aggregate(pipeline)
    // console.log(totalStudentPaid.length)
    // console.log('totalStudentPaid', totalStudentPaid)
    res.status(200).json({ totalStudentPaid: totalStudentPaid.length })
  } catch (error) {
    console.error('Error fetching payments by LGA:', error)
    return next(error)
  }
}

export const mergeStudentsDataIntoPayments = async (req, res, next) => {
  // console.log('🔥Payment Started')

  try {
    const cursor = Student.find().lean().cursor()
    const bulkOps = []
    const batchSize = 1000

    for await (const student of cursor) {
      bulkOps.push({
        updateOne: {
          filter: { accountNumber: student.accountNumber },
          update: {
            $set: {
              firstname: student.firstname,
              surname: student.surname,
              middlename: student.middleName,
              presentClass: student.presentClass,
              LGA: student.lgaOfEnrollment,
              ward: student.ward,
              schoolId: student.schoolId,
            },
          },
        },
      })

      if (bulkOps.length === batchSize) {
        await Payment.bulkWrite(bulkOps, { ordered: false })
        bulkOps.length = 0
      }
    }

    if (bulkOps.length > 0) {
      await Payment.bulkWrite(bulkOps, { ordered: false })
    }

    res
      .status(200)
      .json({ message: 'Students information merged successfully!' })
  } catch (error) {
    return next(error)
  }
}
