import * as aiService from '../ai/ai.service.js';
import { successResponse } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import { COMMON, AI } from '../../constants/codes/index.js';

export const responseQuestion = async (req, res, next) => {
  try {
    const { question, mode = 'minlish' } = req.body; // default mode là minlish nếu không truyền mode

    if (!question)
      return res
        .status(400)
        .json({ success: false, message: 'Bắt buộc nhập câu hỏi' });

    const data = await aiService.responseQuestionService(question, mode);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const autoFillCard = async (req, res, next) => {
  try {
    const { word } = req.body;
    if (!word) {
      throw new AppError(COMMON.INVALID_DATA, 400, [
        { field: 'word', message: 'The word field is required' },
      ]);
    }
    const data = await aiService.generateCardDetailsFromAI(word);
    return res
      .status(200)
      .json(successResponse(AI.CARD_AUTO_FILL_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};
