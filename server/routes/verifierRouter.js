import express from 'express'
import {
  toggleVerifierStatus,
  createVerifier,
  getSingleVerifier,
  loginVerifier,
  getAllVerifiers,
  changeVerifierPassword,
  resetVerifierPassword,
  updateVerifier,
  verifyStudent,
  verifierDashboard
} from '../controllers/index.js'
import { upload } from '../config/multer.js'
import { cloudinaryImageUploader } from '../utils/cloudinaryImageUploader.js'
import {
  authorizePermission,
  authMiddleware,
} from '../middlewares/authenticationMiddleware.js'
const router = express.Router()

router.post(
  '/signup',
  authMiddleware,
  authorizePermission('handle_registrars'),
  upload.single('image'), // Multer middleware to handle single image upload (field name is 'image')
  (req, res, next) =>
    cloudinaryImageUploader(req, res, next, 'verifier_passport'),
  createVerifier
)
router.route('/login').post(loginVerifier)
// router.route('/login/webview')
//     .get(loginWithUrl)
router.get(
  '/',
  authMiddleware,
  authorizePermission(['handle_payments', 'handle_registrars']),
  getAllVerifiers
)
router.get(
  '/get-single/:id',
  authMiddleware,
  authorizePermission(['handle_registrars', 'handle_students']),
  getSingleVerifier
)
router.get(
  '/verifier-dashboard',
  authMiddleware,
  authorizePermission(['handle_verifications']),
  verifierDashboard
)
router.patch(
  '/update/:id',
  authMiddleware,
  authorizePermission('handle_registrars'),
  updateVerifier
)

router.patch('/change-password', authMiddleware, changeVerifierPassword)
router.patch(
  '/reset-password',
  authMiddleware,
  authorizePermission('handle_registrars'),
  resetVerifierPassword
)
router.patch(
    '/toggle-status',
    authMiddleware,
    authorizePermission('handle_registrars'),
    toggleVerifierStatus
)

// ! verification

router.post(
  '/verify-students',
  authMiddleware,
  authorizePermission(['handle_verifications', 'handle_registrars']),
  upload.single('image'),
  (req, res, next) =>
    cloudinaryImageUploader(req, res, next, 'verifications_image'),
  verifyStudent
)

export default router