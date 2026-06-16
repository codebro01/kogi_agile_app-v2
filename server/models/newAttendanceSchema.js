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
    absentReason: {
      type: String,
      enum: ['sick', 'dead', 'relocated', 'dropout', 'other'],
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    term: {
      type: String,
    },
    session: {
      type: String,
    },
    score: Number,
  },
  { timestamps: true }
)

newAttendanceSchema.index({ studentId: 1 });
newAttendanceSchema.index({ date: 1 });
newAttendanceSchema.index({ studentId: 1, date: 1 });
newAttendanceSchema.index({ term: 1, session: 1 });
newAttendanceSchema.index({ month: 1, year: 1 });

export const NewAttendance = model('newAttendance', newAttendanceSchema)
