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
    status: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3, 4], // 0: absent, 1: present, 2: transferred, 3: dropout, 4: died
    },
    score: Number,
  },
  { timestamps: true }
)

export const NewAttendance = model('newAttendance', newAttendanceSchema)
