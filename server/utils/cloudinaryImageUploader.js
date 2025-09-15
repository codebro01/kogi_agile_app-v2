import cloudinary from '../config/cloudinary.js';
import { BadRequestError } from "../errors/index.js";

export const cloudinaryImageUploader = async (req, res, next, cloudinaryFolder) => {
   
    try {
        const image = req.file; // Handle only one image
        if (!image) {
            return next(new BadRequestError('Please select an image file'));
        }


        // Validate image type and size
        const maxSize = 1024 * 1024 * 10; // 2MB
        if (!['image/jpeg', 'image/png'].includes(image.mimetype)) {
            return next(new BadRequestError('Please upload a JPEG or PNG file'));
        }
        if (image.size > maxSize) {
            return next(new BadRequestError('Image file too big, max size is 10MB'));
        }

        // Upload the image to Cloudinary
        const uploadToCloudinary = (buffer) =>
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  {
                    folder: cloudinaryFolder,
                    transformation:
                      req.url === '/verify-students'
                        ? [{ width: 300, height: 300, crop: 'scale' }]
                        : [{ width: 100, height: 100, crop: 'scale' }],
                  },
                  (error, result) => {
                    if (error) {
                      console.error('Cloudinary upload error:', error)
                      reject(
                        new BadRequestError(
                          'Failed to upload image to Cloudinary'
                        )
                      )
                    } else {
                      resolve(result)
                    }
                  }
                )
                stream.end(buffer); // Stream the image buffer
            });

        const result = await uploadToCloudinary(image.buffer);


        // Attach Cloudinary result to the request
        req.uploadedImage = result;

        // Pass control to the next middleware/controller
        return next();
    } catch (err) {
        console.error("Error in cloudinaryImageUploader:", err);
        return next(err); // Ensure error is passed to error-handling middleware
    }
};
