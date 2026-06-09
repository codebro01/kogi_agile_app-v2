import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { logSchema } from './index.js';

const AttendanceTakerSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        lowercase: true,
    },
    assignedSchools: [{
        type: Schema.Types.ObjectId,
        ref: 'AllSchools'
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    randomId: {
        type: Number,
    },
    lastLogged: {
        type: Date,
        default: Date.now,
    },
    roles: [{
        type: Schema.Types.ObjectId,
        ref: "Roles"
    }],
    logs: [logSchema],
    permissions: [],
}, { timestamps: true });

AttendanceTakerSchema.pre('save', async function (next) {
    if (!this.isNew && !this.isModified('password')) return next();

    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

AttendanceTakerSchema.methods.comparePWD = async function (inputedPassword) {
    return bcrypt.compare(inputedPassword, this.password);
};

AttendanceTakerSchema.pre('save', function (next) {
    if (this.isModified('lastLogged')) {
        this.lastLogged = Date.now();
    }
    next();
});

AttendanceTakerSchema.methods.updateLastLogged = function () {
    this.lastLogged = Date.now();
    return this.save();
};

AttendanceTakerSchema.methods.addLog = async function (log) {
    this.logs.push(log);
    if (this.logs.length > 5) {
        this.logs.shift(); // Remove the oldest log
    }
};

export const AttendanceTaker = model('AttendanceTaker', AttendanceTakerSchema);
