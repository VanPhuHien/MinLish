import { successResponse } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import { FILE, COMMON } from '../../constants/codes/index.js';
import { presignedUrlSchema, confirmUploadSchema } from './file.validator.js';
import * as service from './file.service.js';

export const createPresignedUrl = async (req, res, next) => {
  try {
    const result = presignedUrlSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(COMMON.INVALID_DATA, 400, errors));
    }

    const data = await service.createUploadPresignedUrl(
      result.data,
      req.user.id
    );

    return res
      .status(200)
      .json(successResponse(FILE.PRESIGNED_URL_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

export const confirmUpload = async (req, res, next) => {
  try {
    const result = confirmUploadSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(COMMON.INVALID_DATA, 400, errors));
    }

    const data = await service.confirmUpload(result.data, req.user);

    return res.status(200).json(successResponse(FILE.UPLOAD_CONFIRMED, data));
  } catch (error) {
    next(error);
  }
};
