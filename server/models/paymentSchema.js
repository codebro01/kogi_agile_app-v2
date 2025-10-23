import { Schema, model } from 'mongoose'

const PaymentSchema = new Schema(
  {
    studentRandomId: {
      type: String,
      required: false,
    },

    fullName: {
      type: String,
      required: true,
    },

    firstname: {
      type: String,
    },
    surname: {
      type: String,
    },
    middlename: {
      type: String,
    },
    presentClass: {
      type: String,
    },
    paymentType: {
      type: String,
    },
    verificationStatus: {
      type: Boolean,
    },
    totalAttendanceScore: {
      type: Number,
    },
    attendancePercentage: {
      type: String,
    },

    enumeratorId: {
      type: String,
      required: false,
    },
    attdWeek: {
      type: Number,
    },

    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    totalAttendanceScore: {
      type: Number,
    },
    bankName: {
      type: String,
    },
    accountNumber: {
      type: String,
      ref: 'Student',
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
    ward: {
      type: String,
    },
    LGA: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    weekNumber: {
      type: Number,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
    },
    lockStatus: {
      type: Boolean,
      default: false,
    },
    paymentDate: {
      type: String,
    },
  },
  { timestamps: true }
)

PaymentSchema.index({ accountNumber: 1 })

export const Payment = model('Payment', PaymentSchema)
