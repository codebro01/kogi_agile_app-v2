import mongoose, { Schema } from 'mongoose';

const studentStatusEventSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Students',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'AllSchools',
      required: true,
    },
    presentClass: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['dropout', 'transferred', 'deceased'],
      required: true,
    },
    term: {
      type: String,
      required: true,
    },
    session: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Registrars', // or whichever user collection is taking attendance
      required: true,
    },
  },
  { timestamps: true }
);

export const StudentStatusEvent = mongoose.model('StudentStatusEvent', studentStatusEventSchema);
