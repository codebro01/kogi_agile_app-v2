import { Student, Verifier, Verification } from '../models/index.js'
import { createTokenUser } from '../utils/createTokenUser.js'
import {
  attachCookieToResponse,
  generateRandomId,
  addLogToUser,
} from '../utils/index.js'
import { StatusCodes } from 'http-status-codes'
import { BadRequestError } from '../errors/badRequestError.js'
import { NotFoundError } from '../errors/notFoundError.js'
import { Roles } from '../models/rolesSchema.js'
import { NotAuthenticatedError } from '../errors/notAuthenticatedError.js'

export const getAllVerifiers = async (req, res, next) => {
  try {
    const verifiers = await Verifier.find({})
      .select(
        '-password -logs -lastLogged -permissions -roles -accountNumber -bankName'
      )
      .sort('fullName')
      .collation({ locale: 'en', strength: 2 })
    res.status(200).json({ verifiers, total: verifiers.length })
  } catch (err) {
    return next(err)
  }
}

export const getSingleVerifier = async (req, res, next) => {
  try {
    const { id } = req.params
    const verifier = await Verifier.findById({ _id: id }).select(
      '-password -roles -permissions -logs'
    )
    if (!verifier)
      return next(new NotFoundError(`There is no user with id: ${id}`))
    res.status(200).json(verifier)
  } catch (err) {
    return next(err)
  }
}

export const createVerifier = async (req, res, next) => {
  // console.log('got in here')
  try {
    if(req.body.gender  === '') req.body = {...req.body, gender: "Others"}
    const verifierRole = await Roles.findOne({ role: 'verifier' })
    const lastLogged = new Date(Date.now())
    // await Verifier.deleteMany({});
    const uploadedImage = req.uploadedImage
    if (!uploadedImage) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'No uploaded image found' })
    }
    const { secure_url, public_id } = uploadedImage

    const isExistingEmail = await Verifier.findOne({ email: req.body.email })
    const isExistingAccountNumber = await Verifier.findOne({
      accountNumber: req.body.accountNumber,
    })
    const isExistingPhone = await Verifier.findOne({ phone: req.body.phone })
    if (isExistingEmail)
      return next(
        new BadRequestError('User already exist with email: ' + req.body.email)
      )
    if (isExistingAccountNumber)
      return next(
        new BadRequestError(
          'User already exist with Account Number: ' + req.body.accountNumber
        )
      )
    if (isExistingPhone)
      return next(
        new BadRequestError(
          'User already exist with phone Number: ' + req.body.phone
        )
      )
    //   console.log('verifierRole', verifierRole)
    const generatedRandomId = generateRandomId()

    const verifier = await Verifier.create({
      ...req.body,
      roles: [verifierRole._id],
      permissions: [verifierRole.permissions],
      lastLogged,
      passport: secure_url,
      randomId: generatedRandomId,
    })

    if (!verifier)
      return next(new BadRequestError('An error occured creating Enumerator'))
    const verifierObj = verifier.toObject() // convert Mongoose doc to plain object
    delete verifierObj.password
    res.status(200).json({ verifier: verifierObj, verifierRole })
  } catch (err) {
    return next(err)
  }
}

export const loginVerifier = async (req, res, next) => {
    // console.log('entered here')
  try {
    let { email, password } = req.body
    // console.log(req.body)
    if (!email || !password)
      return next(new BadRequestError('Email and password is required'))
    const user = await Verifier.findOne({ email })
    if (!user) return next(new NotFoundError('User not found'))
    if (user.isActive === false)
      return next(new NotAuthenticatedError('User has been disabled'))
    const isMatch = await user.comparePWD(password)
    if (!isMatch) return next(new NotFoundError('invalid credentials'))
    await user.populate({
      path: 'roles', // Populate roles
      populate: {
        path: 'permissions', // Populate permissions within each role
        select: 'name', // Select only the "name" field of permissions
      },
    })
    const tokenUser = createTokenUser(user)
    const allPermissionNames = tokenUser.roles.flatMap((role) =>
      role.permissions.map((permission) => permission.name)
    )

    const token = attachCookieToResponse({ user: tokenUser })
    const sessionData = req.session

    addLogToUser(Verifier, user._id, 'Enumerator logged in', req.ip, {
      sessionId: sessionData.id || 'unknown',
      sessionCreated: sessionData.cookie._expires,
      data: sessionData, // Add any relevant session details
    })
    res.status(StatusCodes.OK).json({ tokenUser, token, allPermissionNames })
  } catch (err) {
    return next(err)
  }
}

// export const loginWithUrl = async (req, res, next) => {
//   const { email, randomId } = req.query

//   if (!email || !randomId)
//     return next(new BadRequestError('email and randomId is required'))
//   const user = await Verifier.findOne({ email })
//   if (user.isActive === false)
//     return next(new NotAuthenticatedError('User has been disabled'))
//   if (!user) return next(new NotFoundError('User not found'))
//   const isMatch = user.randomId == randomId
//   if (!isMatch) return next(new NotFoundError('invalid user'))
//   await user.populate({
//     path: 'roles', // Populate roles
//     populate: {
//       path: 'permissions', // Populate permissions within each role
//       select: 'name', // Select only the "name" field of permissions
//     },
//   })
//   const tokenUser = createTokenUser(user)
//   const allPermissionNames = tokenUser.roles.flatMap((role) =>
//     role.permissions.map((permission) => permission.name)
//   )

//   const token = attachCookieToResponse({ user: tokenUser })
//   const sessionData = req.session

//   addLogToUser(Verifier, user._id, 'Enumerator logged in', req.ip, {
//     sessionId: sessionData.id || 'unknown',
//     sessionCreated: sessionData.cookie._expires,
//     data: sessionData, // Add any relevant session details
//   })
//   res.status(StatusCodes.OK).json({ tokenUser, token, allPermissionNames })
// }

export const updateVerifier = async (req, res, next) => {
  try {
    let secure_url
    if (req.file) {
      const uploadedImage = req.uploadedImage
      secure_url = uploadedImage
    }
    const { id } = req.params

    const { permissions } = req.user
    const verifier = await Verifier.findById({ _id: id })

    if (!verifier)
      return next(new NotFoundError('There is no verifier  with id: ' + id))

    const updatedVerifier = await Verifier.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true, runValidators: true }
    )
    if (!updatedVerifier)
      return next(new Error('An Error occured while trying to update verifier'))
    res.status(StatusCodes.OK).json({ updatedVerifier: updatedVerifier })
  } catch (err) {
    return next(err)
  }
}

export const changeVerifierPassword = async (req, res, next) => {
  try {
    const { userID } = req.user
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword)
      return next(
        new BadRequestError(
          'current and new password is required to update you password'
        )
      )
    const user = await Verifier.findById({ _id: userID })
    if (!user) return next(new NotFoundError(`No user not found`))
    const hashedPassword = await user.comparePWD(currentPassword)
    if (!hashedPassword) return next(new BadRequestError('Wrong password'))
    if (currentPassword === newPassword)
      return next(
        new BadRequestError(
          'Please change the password, you are setting the same old password'
        )
      )
    user.password = newPassword
    await user.validate(['password'])
    await user.save()

    const tokenUser = createTokenUser(user)
    const token = attachCookieToResponse({ user: tokenUser })
    const sessionData = req.session
    addLogToUser(Verifier, user._id, 'Verifier changed password', req.ip, {
      sessionId: sessionData.id || 'unknown',
      sessionCreated: sessionData.cookie._expires,
      data: sessionData, // Add any relevant session details
    })
    res
      .status(StatusCodes.OK)
      .json({ message: 'Password has been successfully changed' })
  } catch (err) {
    console.log(err)
    return next(err)
  }
}
export const resetVerifierPassword = async (req, res, next) => {
  try {
    const { id } = req.query
    if (!id) return next(new BadRequestError('User not found, or invalid id'))
    const user = await Verifier.findById({ _id: id })
    if (!user) return next(new NotFoundError(`No user found`))
    user.password = '123456'
    await user.save()
    res.status(StatusCodes.OK).json({ message: `Password reset successful` })
  } catch (err) {
    return next(err)
  }
}

export const toggleVerifierStatus = async (req, res, next) => {
  try {
    const { id } = req.query

    const user = await Verifier.findById(id)
    if (!user) return next(new NotFoundError('User not found'))

    user.isActive = !user.isActive

    const updatedUser = await user.save()

    res.status(StatusCodes.OK).json({
      message: `User has been successfully ${
        user.isActive ? 'enabled' : 'disabled'
      }`,
      user: updatedUser,
    })
  } catch (err) {
    return next(err)
  }
}

export const deleteVerifier = async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await Verifier.findById({ _id: id })
    if (!user) return next(new NotFoundError(`user not found`))

    await Verifier.findByIdAndDelete({ _id: id })
    res
      .status(StatusCodes.OK)
      .json({ message: `User hase been successfully deleted` })
  } catch (err) {
    return next(err)
  }
}

// ! verifier's dashboard

export const verifierDashboard = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'verifications',
          localField: '_id',
          foreignField: 'studentId',
          as: 'verification',
        },
      },
      {
        $addFields: {
          verified: {
            $cond: [
              { $gt: [{ $size: '$verification' }, 0] },
              { $arrayElemAt: ['$verification.verified', 0] },
              false,
            ],
          },
        },
      },
      {
        $facet: {
          totalStudents: [{ $count: 'count' }],
          verifiedStudents: [
            { $match: { verified: true } },
            { $count: 'count' },
          ],
          unverifiedStudents: [
            { $match: { verified: false } },
            { $count: 'count' },
          ],
          schoolsWithVerifiedStudents: [
            { $match: { verified: true } },
            {
              $group: {
                _id: '$schoolId',
              },
            },
            { $count: 'count' },
          ],
          schoolsWithUnverifiedStudents: [
            { $match: { verified: false } },
            {
              $group: {
                _id: '$schoolId',
              },
            },
            { $count: 'count' },
          ],
        },
      },
      {
        $project: {
          totalStudents: { $arrayElemAt: ['$totalStudents.count', 0] },
          verifiedCount: { $arrayElemAt: ['$verifiedStudents.count', 0] },
          unverifiedCount: { $arrayElemAt: ['$unverifiedStudents.count', 0] },
          schoolsWithVerifiedStudentsCount: {
            $arrayElemAt: ['$schoolsWithVerifiedStudents.count', 0],
          },
          schoolsWithUnverifiedStudentsCount: {
            $arrayElemAt: ['$schoolsWithUnverifiedStudents.count', 0],
          },
        },
      },
    ]

    // console.log(await Verification.countDocuments({}));

    const verifierDashboardData = await Student.aggregate(pipeline)

    // const testPipeline = [
    //   {
    //     $lookup: {
    //       from: 'students',
    //       localField: 'studentId',
    //       foreignField: '_id',
    //       as: 'student',
    //     },
    //   },
    // ]
    // const result = await Verification.aggregate(testPipeline)
    // console.log(result)

    res.status(StatusCodes.OK).json({ verifierDashboardData })
  } catch (error) {
    return next(error)
  }
}
