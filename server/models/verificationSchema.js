import { Schema, model } from 'mongoose'

const VerificationSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'students',
    },
    verificationImage: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    cardNo: {
      type: String,
      unique: true
    },
    reasonNotVerified: {
      type: String,
    },
  },
  { timestamps: true }
)

export const Verification = model('verification', VerificationSchema)
