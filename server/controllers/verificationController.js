import { Verification, Student } from '../models/index.js'
import { BadRequestError, NotFoundError } from '../errors/index.js'
import { StatusCodes } from 'http-status-codes'
import { Types } from 'mongoose'

export const verifyStudent = async (req, res, next) => {
  try {
    // console.log(req.body)
    const verificationImage = req.uploadedImage
// await Verification.collection.dropIndex('cardNo_1')

    let { studentId, verified, cardNo, reasonNotVerified } = req.body;
    if(verified === 'true'){
      if ((!studentId, !cardNo))
        return next(new BadRequestError('Fill all necessary fields'))
      
    }
    if(verified === 'false') {
      
      if ((!reasonNotVerified))
        return next(new BadRequestError('Fill all necessary fields'))
    }

    studentId = new Types.ObjectId(studentId)
    // console.log(req.uploadedImage)
    const student = await Student.findOne({ _id: studentId })
    if (!student)
      return next(
        new NotFoundError(`Could not find student with id: ${studentId}`)
      )

    const verify = await Verification.findOneAndUpdate(
      { studentId },
      {
        $set: {
          verified,
          cardNo: cardNo || "",
          reasonNotVerified,
          verificationImage: verificationImage?.secure_url || "",
        },
      },
      {
        upsert: true,
        new: true,
      }
    )
    await Student.findOneAndUpdate(
      { _id: studentId },
      {
        verificationStatus: verified,
      },
      {
        new: true,
        runValidators: true,
      }
    )

    res.status(StatusCodes.OK).json({
      verify,
      message: `Students verification status has been successfully updated!!!`,
    })
  } catch (error) {
    console.log(error)
    return next(error)
  }
}
