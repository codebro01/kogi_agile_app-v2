import { Verification, Student } from '../models/index.js'
import { BadRequestError, NotFoundError } from '../errors/index.js';
import {StatusCodes} from 'http-status-codes';

export const verifyStudent = async (req, res, next) => {
  try {
    const verificationImage = req.uploadedImage

    const { studentId, verified, cardNo, reasonNotVerified } = req.body;
    if(!studentId, !verified, !cardNo ) return next(new BadRequestError('Fill all necessary fields')); 
    // console.log(req.uploadedImage)
    const student = await Student.findOne({ _id: studentId })
    if (!student)
      return next(new NotFoundError(`Could not find student with id: ${studentId}`))
  
    const verify = await Verification.findOneAndUpdate(
      { studentId },
      {
        $set: {
          verified,
          cardNo,
          reasonNotVerified,
          verificationImage: verificationImage.secure_url,
        },
      },
      {
        upsert: true,
        new: true, 
      }
    )

    res.status(StatusCodes.OK).json({verify, message: `Students verification status has been successfully updated!!!`})

  } catch (error) {
    console.log(error)
    return next(error)
  }
}

