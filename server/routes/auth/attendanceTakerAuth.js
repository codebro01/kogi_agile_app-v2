import express from 'express';
import { 
    createAttendanceTaker, 
    loginAttendanceTaker, 
    getAllAttendanceTakers, 
    updateAttendanceTaker, 
    getSingleAttendanceTaker, 
    resetAttendanceTakerPassword, 
    toggleAttendanceTakerStatus 
} from '../../controllers/attendanceTakerController.js';
import { authorizePermission, authMiddleware } from '../../middlewares/authenticationMiddleware.js';

const router = express.Router();

router.post('/register', authMiddleware, authorizePermission('handle_admins'), createAttendanceTaker); // Usually admin creates them
router.post('/login', loginAttendanceTaker);
router.get('/', authMiddleware, authorizePermission('handle_admins'), getAllAttendanceTakers);
router.get('/get-single/:id', authMiddleware, authorizePermission('handle_admins'), getSingleAttendanceTaker);
router.patch('/update/:id', authMiddleware, authorizePermission('handle_admins'), updateAttendanceTaker);
router.patch('/reset-password', authMiddleware, authorizePermission('handle_admins'), resetAttendanceTakerPassword);
router.patch('/toggle-status', authMiddleware, authorizePermission('handle_admins'), toggleAttendanceTakerStatus);

export default router;
