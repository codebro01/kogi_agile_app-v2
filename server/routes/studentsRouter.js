import express from 'express'
import {
  getAllStudents,
  importPaymentSheet,
  filterAndView,
  filterAndDownload,
  updateStudent,
  filterEnumeratorsByStudents,
  deleteStudent,
  createStudent,
  downloadAttendanceSheet,
  enumeratorsByyHighestRegisteredStudents,
  lgasByHighestRegisteredStudents,
  uploadAttendanceSheet,
  getStudentsAttendance,
  getStudentsStats,
  totalStudentsByEnumerators,
  getDuplicateRecord,
  deleteManyStudents,
  promoteSingleStudent,
  promotePlentyStudents,
  demotePlentyStudents,
  demoteSingleStudent,
  adminViewAttendance,
  adminDeleteAttendances,
  updateStudentsBankAccountDetails,
  EditManyStudents,
  SyncStudentsVerification,
  getSchoolsByStudentsRegistered,
  getLgasByStudentsRegistered,
} from '../controllers/index.js'
import {
  authMiddleware,
  authorizePermission,
} from '../middlewares/authenticationMiddleware.js'
import { upload, uploadXLSX } from '../config/multer.js'
import { cloudinaryImageUploader } from '../utils/cloudinaryImageUploader.js'
import {
  XLSXUploader,
  XLSXUploaderAccountDetails,
  XLSXUploaderPaymentInformation,
} from '../utils/excelFileUploader.js'

const router = express.Router()

router
  .route('/')
  .get(authMiddleware, authorizePermission('handle_students'), getAllStudents)
  .post(
    authorizePermission('handle_students'),
    upload.single('image'),
    (req, res, next) =>
      cloudinaryImageUploader(req, res, next, 'student_passport'),
    createStudent
  )
router
  .route('/:id')
  .delete(authorizePermission('delete_operations'), deleteStudent)
router.route('/:id').patch(
  authMiddleware,
  authorizePermission('handle_students'),
  upload.single('image'),
  async (req, res, next) => {
    if (req.file) {
      await cloudinaryImageUploader(req, res, next, 'student_passport')
    }
    next()
  },
  updateStudent
)
router.delete(
  '/delete/delete-many/',
  authMiddleware,
  authorizePermission('handle_registrars'),
  deleteManyStudents
)
router.delete(
  '/delete/delete-many-attendances/',
  authMiddleware,
  authorizePermission('handle_admins'),
  adminDeleteAttendances
)
router.get(
  '/download',
  authMiddleware,
  authorizePermission('handle_registrars'),
  filterAndDownload
)
router.get(
  '/get-students-stats',
  authMiddleware,
  authorizePermission([
    'handle_registrars',
    'handle_payments',
    'handle_verifications',
  ]),
  getStudentsStats
)
router.get(
  '/admin-view-all-students',
  authMiddleware,
  authorizePermission(['handle_payments', 'handle_admins', 'handle_students']),
  filterAndView
)
router.get(
  '/view-attendance-sheet',
  authMiddleware,
  authorizePermission([
    'handle_admins',
    'handle_registrars',
    'handle_payments',
    'handle_students',
  ]),
  getStudentsAttendance
)
router.get(
  '/admin-view-attendance-sheet',
  authMiddleware,
  authorizePermission(['handle_registrars']),
  adminViewAttendance
)
router.get(
  '/attendance-sheet',
  authMiddleware,
  authorizePermission('handle_students'),
  downloadAttendanceSheet
)
router.post(
  '/upload-attendance-sheet',
  uploadXLSX.single('file'),
  XLSXUploader,
  authorizePermission('handle_students'),
  uploadAttendanceSheet
)
router.post(
  '/upload-payment-sheet',
  uploadXLSX.single('file'),
  XLSXUploaderPaymentInformation,
  authorizePermission('handle_payments'),
  importPaymentSheet
)
router.patch(
  '/update/bank-account-details',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments']),
  uploadXLSX.single('file'),
  XLSXUploaderAccountDetails,
  updateStudentsBankAccountDetails
)
router.patch(
  '/update/edit-students-details',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_payments']),
  EditManyStudents
)
router.get(
  '/from-to',
  authorizePermission('handle_students'),
  filterEnumeratorsByStudents
)
router.get(
  '/enumerators-student-count',
  authMiddleware,
  authorizePermission('handle_registrars'),
  enumeratorsByyHighestRegisteredStudents
)
router.get(
  '/top-lga-count',
  authMiddleware,
  authorizePermission('handle_registrars'),
  lgasByHighestRegisteredStudents
)
router.get(
  '/manage-duplicate-records',
  authMiddleware,
  authorizePermission('handle_registrars'),
  getDuplicateRecord
)
router.get(
  '/total-students-by-enumerators',
  authMiddleware,
  authorizePermission('handle_registrars'),
  totalStudentsByEnumerators
)
router.patch(
  '/promote/single/student',
  authMiddleware,
  authorizePermission(['handle_admins', 'handle_registrars']),
  promoteSingleStudent
)
router.patch(
  '/demote/single/student',
  authMiddleware,
  authorizePermission('handle_admins'),
  demoteSingleStudent
)
router.patch(
  '/promote/plenty/students',
  authMiddleware,
  authorizePermission(['handle_admins', 'handle_registrars']),
  promotePlentyStudents
)
router.patch(
  '/demote/plenty/students',
  authMiddleware,
  authorizePermission(['handle_admins', 'handle_registrars']),
  demotePlentyStudents
)
router.patch(
  '/sync/verifications',
  authMiddleware,
  authorizePermission(['handle_registrars']),
  SyncStudentsVerification
)
router.get(
  '/admin/schools-by-students-registered',
  authMiddleware,
  authorizePermission(['handle_registrars']),
  getSchoolsByStudentsRegistered
)
router.get(
  '/admin/lgas-by-students-registered',
  authMiddleware,
  authorizePermission(['handle_registrars']),
  getLgasByStudentsRegistered
)

export default router
