import { successResponse } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import {
  getLessonSchema,
  listLessonsSchema,
  getSegmentsSchema,
} from './lesson.validator.js';
import * as service from './lesson.service.js';

export const listLessons = async (req, res, next) => {
  try {
    const result = listLessonsSchema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const userId = req.user?.id ?? null;
    const data = await service.listLessons(result.data, userId);

    return res
      .status(200)
      .json(successResponse('Lấy danh sách bài học thành công.', data));
  } catch (error) {
    next(error);
  }
};

export const getLessonById = async (req, res, next) => {
  try {
    const result = getLessonSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const userId = req.user?.id ?? null;
    const data = await service.getLessonById(result.data.lessonId, userId);

    return res
      .status(200)
      .json(successResponse('Lấy chi tiết bài học thành công.', data));
  } catch (error) {
    next(error);
  }
};

export const getSegments = async (req, res, next) => {
  try {
    const result = getSegmentsSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const userId = req.user?.id ?? null;
    const data = await service.getSegmentsByLessonId(
      result.data.lessonId,
      userId
    );

    return res
      .status(200)
      .json(successResponse('Lấy segments thành công', data));
  } catch (err) {
    next(err);
  }
};
