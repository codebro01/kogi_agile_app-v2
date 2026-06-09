import {
  createOrUpdateAttendance,
  getAttendanceTable,
  downloadAttendanceRecordExcel,
  getAttendanceAnalytics,
  getMonthlyAttendanceTrend
} from '../controllers/index.js'
import express from 'express'

import {
  authorizePermission,
  authMiddleware,
} from '../middlewares/authenticationMiddleware.js'
const router = express.Router()

router.post(
  '/',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  createOrUpdateAttendance
)
router.get(
  '/',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  getAttendanceTable
)
router.get(
  '/download-attendance-record',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  getAttendanceTable,
  downloadAttendanceRecordExcel
)
router.get(
  '/analytics',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  getAttendanceAnalytics
)
router.get(
  '/monthly-trend',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  getMonthlyAttendanceTrend
)

export default router
