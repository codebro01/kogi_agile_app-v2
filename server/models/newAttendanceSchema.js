import { model, Schema } from 'mongoose';

const newAttendanceSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    present: {
      type: Boolean,
      required: true,
    },
    score: Number, 
  },
  { timestamps: true }
)

export const NewAttendance = model('newAttendance', newAttendanceSchema)
