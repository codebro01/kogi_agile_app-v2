import { model, Schema } from 'mongoose';

const systemControlSchema = new Schema(
    {
        // Global lock for all attendance submissions
        allowAttendance: {
            type: Boolean,
            default: true,
            required: true,
        },

        // Global lock for new student enrollments
        allowEnrollment: {
            type: Boolean,
            default: true,
            required: true,
        },

        // Global lock for student verifications
        allowVerification: {
            type: Boolean,
            default: true,
            required: true,
        },

    },
    {
        timestamps: true
    }
);

export const SystemControl = model('SystemControl', systemControlSchema);