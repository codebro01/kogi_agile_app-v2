import {
  createOrUpdateAttendance,
  getAttendanceTable,
  downloadAttendanceRecordExcel,
} from '../controllers/index.js'
import express from 'express';

import { authorizePermission, authMiddleware } from '../middlewares/authenticationMiddleware.js';
const router = express.Router();

router.post(
  '/',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments']),
  createOrUpdateAttendance
)
router.get(
  '/',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments']),
  getAttendanceTable
)
router.get(
  '/download-attendance-record',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments']),
  getAttendanceTable,
  downloadAttendanceRecordExcel
)



export default router;