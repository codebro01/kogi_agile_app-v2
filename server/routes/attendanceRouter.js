import {
  createOrUpdateAttendance,
  getAttendanceTable,
  downloadAttendanceRecordExcel,
  getAttendanceAnalytics,
  getMonthlyAttendanceTrend,
  getStudentsForAttendance,
  createOrUpdateTermlyAverage,
  getTermlyAverage,
  exportEmptyAverageSheet,
  importAverageRecords,
  exportAverageRecords,
  getAverageChartData,
  submitSchoolDailyAttendance
} from '../controllers/index.js'
import express from 'express'

import {
  authorizePermission,
  authMiddleware,
} from '../middlewares/authenticationMiddleware.js'
import { uploadXLSX } from '../config/multer.js'
const router = express.Router()

router.post(
  '/',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  createOrUpdateAttendance
)
router.post(
  '/school-daily',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  submitSchoolDailyAttendance
)
router.get(
  '/',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  getAttendanceTable
)
router.get(
  '/students-for-attendance',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  getStudentsForAttendance
)
router.post(
  '/termly-average',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  createOrUpdateTermlyAverage
)
router.get(
  '/termly-average',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  getTermlyAverage
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

// Result Average Features
router.get(
  '/export-average-template',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  exportEmptyAverageSheet
)

router.post(
  '/import-average-records',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  uploadXLSX.single('file'),
  importAverageRecords
)

router.get(
  '/export-average-records',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  exportAverageRecords
)

router.get(
  '/average-chart-data',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments', 'handle_attendance']),
  getAverageChartData
)

export default router
