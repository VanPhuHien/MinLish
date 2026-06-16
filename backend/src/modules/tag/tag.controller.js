import { successResponse } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import { listTagsSchema } from './tag.validator.js';
import * as service from './tag.service.js';

export const listTags = async (req, res, next) => {
  try {
    const result = listTagsSchema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const tags = await service.listTags(result.data);
    return res
      .status(200)
      .json(successResponse('Lấy danh sách tag thành công.', tags));
  } catch (error) {
    next(error);
  }
};
