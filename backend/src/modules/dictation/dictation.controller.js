import { successResponse } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import * as service from './dictation.service.js';

export const submitSegmentProgress = async (req, res, next) => {
  try {
    const { lessonId, segmentId } = req.params;
    const userId = req.user._id;
    const { mode, userInput } = req.body;

    if (mode !== 'dictation') {
      // Do shadowing xử lý riêng
      return next(new AppError('Invalid mode', 400));
    }

    const { score, completed, progress } =
      await service.submitDictationProgress(
        userId,
        lessonId,
        segmentId,
        userInput
      );

    return res.status(200).json(
      successResponse('Nộp kết quả thành công', {
        score,
        completed,
        progress,
      })
    );
  } catch (err) {
    next(err);
  }
};
