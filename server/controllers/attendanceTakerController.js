import { BadRequestError, NotFoundError } from "../errors/index.js";
import { AttendanceTaker, Roles } from "../models/index.js";
import { StatusCodes } from 'http-status-codes';
import { attachCookieToResponse, createTokenUser, generateRandomId } from "../utils/index.js";

export const getAllAttendanceTakers = async (req, res, next) => {
    try {
        const attendanceTakers = await AttendanceTaker.find({}).populate('assignedSchools').sort('-createdAt').select('-password');
        return res.status(StatusCodes.OK).json({ attendanceTakers, totalAttendanceTakers: attendanceTakers.length });
    } catch (err) {
        return next(err);
    }
}

export const getSingleAttendanceTaker = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attendanceTaker = await AttendanceTaker.findById(id).populate('assignedSchools');
        if (!attendanceTaker) return next(new NotFoundError(`No attendance taker found with id: ${id}`));
        res.status(StatusCodes.OK).json({ attendanceTaker });
    } catch (err) {
        return next(err);
    }
}

export const createAttendanceTaker = async (req, res, next) => {
    try {
        const { email, password, fullName, assignedSchools } = req.body;
        if (!email || !password || !fullName) {
            return next(new BadRequestError('Please provide all required fields'));
        }

        const userExist = await AttendanceTaker.findOne({ email });
        if (userExist) return next(new BadRequestError('Email already exist'));

        const attendanceTakerRole = await Roles.findOne({ role: 'attendance_taker' });
        const roles = attendanceTakerRole ? [attendanceTakerRole._id] : [];

        const generatedRandomId = generateRandomId();
        const attendanceTaker = await AttendanceTaker.create({
            email,
            password,
            fullName,
            assignedSchools: assignedSchools || [],
            randomId: generatedRandomId,
            roles
        });

        res.status(StatusCodes.CREATED).json({ msg: "Attendance Taker created successfully", attendanceTaker });
    } catch (err) {
        return next(err);
    }
}

export const loginAttendanceTaker = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return next(new BadRequestError("Email and password is required"));

        const user = await AttendanceTaker.findOne({ email });
        if (!user) return next(new NotFoundError('Invalid credentials'));
        if (!user.isActive) return next(new BadRequestError('Account is disabled, please contact admin'));

        const isMatch = await user.comparePWD(password);
        if (!isMatch) return next(new NotFoundError('Invalid credentials'));

        await user.populate({
            path: 'roles',
            populate: {
                path: 'permissions',
                select: 'name',
            },
        });
        await user.populate('assignedSchools');

        const tokenUser = createTokenUser(user);
        tokenUser.assignedSchools = user.assignedSchools; // Include schools in token user if needed

        const token = attachCookieToResponse({ user: tokenUser });
        res.status(StatusCodes.OK).json({ tokenUser, token });
    } catch (err) {
        return next(err);
    }
}

export const updateAttendanceTaker = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attendanceTaker = await AttendanceTaker.findById(id);

        if (!attendanceTaker) return next(new NotFoundError('There is no attendance taker with id: ' + id));

        // Avoid updating password directly through this route if using pre-save hooks, 
        // findByIdAndUpdate bypasses pre-save. Better to find and save, or omit password.
        const { password, ...updateData } = req.body; 

        const updatedTaker = await AttendanceTaker.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('assignedSchools');
        
        res.status(StatusCodes.OK).json({ updatedAttendanceTaker: updatedTaker });
    } catch (err) {
        return next(err);
    }
}

export const resetAttendanceTakerPassword = async (req, res, next) => {
    try {
        const { id } = req.query;
        if (!id) return next(new BadRequestError("Invalid id"));
        const user = await AttendanceTaker.findById(id);
        if (!user) return next(new NotFoundError(`No user found`));
        user.password = "123456";
        await user.save();
        res.status(StatusCodes.OK).json({ message: `Password reset successful` });
    } catch (err) {
        return next(err);
    }
}

export const toggleAttendanceTakerStatus = async (req, res, next) => {
    try {
        const { id } = req.query;
        const user = await AttendanceTaker.findById(id);
        if (!user) return next(new NotFoundError('User not found'));

        user.isActive = !user.isActive;
        const updatedUser = await user.save();

        res.status(StatusCodes.OK).json({
            message: `User has been successfully ${user.isActive ? 'enabled' : 'disabled'}`,
            user: updatedUser,
        });
    } catch (err) {
        return next(err);
    }
};
