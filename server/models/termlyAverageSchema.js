import { model, Schema } from 'mongoose';

const termlyAverageSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Students',
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
    averageScore: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const TermlyAverage = model('termlyAverage', termlyAverageSchema);
