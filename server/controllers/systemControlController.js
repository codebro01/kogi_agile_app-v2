import { SystemControl } from '../models/index.js';

// @desc    Get system control settings
// @route   GET /api/v1/system-control
// @access  Private/Admin
export const getSystemControl = async (req, res) => {
    try {
        let systemControl = await SystemControl.findOne();
        
        // If somehow it doesn't exist, create it (fallback, though server.js handles it)
        if (!systemControl) {
            systemControl = await SystemControl.create({
                allowAttendance: true,
                allowEnrollment: true,
                allowVerification: true,
            });
        }
        
        res.status(200).json(systemControl);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching system control settings', error: error.message });
    }
};

// @desc    Update system control settings
// @route   PUT /api/v1/system-control
// @access  Private/Admin
export const updateSystemControl = async (req, res) => {
    try {
        const { allowAttendance, allowEnrollment, allowVerification } = req.body;
        
        let systemControl = await SystemControl.findOne();
        
        if (!systemControl) {
             systemControl = await SystemControl.create({
                allowAttendance: true,
                allowEnrollment: true,
                allowVerification: true,
            });
        }

        if (allowAttendance !== undefined) systemControl.allowAttendance = allowAttendance;
        if (allowEnrollment !== undefined) systemControl.allowEnrollment = allowEnrollment;
        if (allowVerification !== undefined) systemControl.allowVerification = allowVerification;
        
        await systemControl.save();
        
        res.status(200).json(systemControl);
    } catch (error) {
        res.status(500).json({ message: 'Error updating system control settings', error: error.message });
    }
};
