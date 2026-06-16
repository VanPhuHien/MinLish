import { successResponse } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import { presignedUrlSchema } from './file.validator.js';
import * as service from './file.service.js';

export const createPresignedUrl = async (req, res, next) => {
  try {
    const result = presignedUrlSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const data = await service.createUploadPresignedUrl(
      result.data,
      req.user.id
    );

    return res
      .status(200)
      .json(successResponse('Tạo presigned URL thành công.', data));
  } catch (error) {
    next(error);
  }
};
