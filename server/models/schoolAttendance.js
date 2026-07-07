import { model, Schema } from 'mongoose';

/**
 * schoolAttendanceSchema
 * -----------------------
 * One document per school per day (NOT per student per day).
 * Only absent/exception students are stored in `absentees`.
 * A student not listed = present, PROVIDED attendanceTaken is true.
 */
const schoolAttendanceSchema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },

    date: {
      type: Date,
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

    term: {
      type: String, // "First Term" | "Second Term" | "Third Term"
      required: true,
    },

    session: {
      type: String, // e.g. "2025/2026"
      required: true,
    },

    attendanceTaken: {
      type: Boolean,
      required: true,
      default: false,
    },

    totalEnrolled: {
      type: Number,
      required: true,
    },

    absentees: [
      {
        studentId: {
          type: Schema.Types.ObjectId,
          ref: 'Student',
          required: true,
        },
        presentClass: {
          type: String,
        },
        reason: {
          type: String,
          enum: ["0"], // 0: absent (stored as string for now in Mongoose or castable)
          default: "0",
        },
        note: {
          type: String,
        },
      },
    ],

    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

schoolAttendanceSchema.index({ schoolId: 1, date: 1 }, { unique: true });
schoolAttendanceSchema.index({ date: 1 });
schoolAttendanceSchema.index({ term: 1, session: 1 });
schoolAttendanceSchema.index({ schoolId: 1, term: 1, session: 1 });
schoolAttendanceSchema.index({ 'absentees.studentId': 1 });

export const SchoolAttendance = model('SchoolAttendance', schoolAttendanceSchema);
