import { successResponse } from '../../utils/response.js';
import * as service from './cefrLevel.service.js';

export const listCefrLevels = async (req, res, next) => {
  try {
    const levels = await service.listCefrLevels();
    return res
      .status(200)
      .json(successResponse('Lấy danh sách CEFR level thành công.', levels));
  } catch (error) {
    next(error);
  }
};
