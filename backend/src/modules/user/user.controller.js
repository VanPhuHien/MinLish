import * as userService from './user.service.js';
import AppError from '../../utils/AppError.js';
import { COMMON } from '../../constants/codes/index.js';
import {
  getLessonSegmentsProgressSchema,
  getSegmentProgressSchema,
  updateSegmentProgressSchema,
} from './user.validator.js';

export const getLessonSegmentsProgress = async (req, res, next) => {
  try {
    const result = getLessonSegmentsProgressSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(COMMON.INVALID_DATA, 400, errors));
    }

    const { lessonId } = result.data;
    const userId = req.user.id;
    const progressList = await userService.getLessonSegmentsProgress(
      userId,
      lessonId
    );
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách segment progress của lesson thành công',
      data: progressList,
    });
  } catch (error) {
    next(error);
  }
};

export const getSegmentProgress = async (req, res, next) => {
  try {
    const result = getSegmentProgressSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(COMMON.INVALID_DATA, 400, errors));
    }

    const { lessonId, segmentId } = result.data;
    const userId = req.user.id;
    const progress = await userService.getSegmentProgress(
      userId,
      lessonId,
      segmentId
    );
    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết segment progress thành công',
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSegmentProgress = async (req, res, next) => {
  try {
    const paramsResult = updateSegmentProgressSchema.shape.params.safeParse(req.params);
    const bodyResult = updateSegmentProgressSchema.shape.body.safeParse(req.body);

    if (!paramsResult.success || !bodyResult.success) {
      const errors = [];
      if (!paramsResult.success) {
        errors.push(
          ...paramsResult.error.errors.map((e) => ({
            field: 'params.' + e.path.join('.'),
            message: e.message,
          }))
        );
      }
      if (!bodyResult.success) {
        errors.push(
          ...bodyResult.error.errors.map((e) => ({
            field: 'body.' + e.path.join('.'),
            message: e.message,
          }))
        );
      }
      return next(new AppError(COMMON.INVALID_DATA, 400, errors));
    }

    const { lessonId, segmentId } = paramsResult.data;
    const data = bodyResult.data;
    const userId = req.user.id;
    const progress = await userService.updateSegmentProgress(
      userId,
      lessonId,
      segmentId,
      data
    );
    res.status(200).json({
      success: true,
      message: 'Cập nhật một phần segment progress thành công',
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};