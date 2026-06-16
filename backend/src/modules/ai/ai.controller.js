import { responseQuestionService } from './ai.service.js';

export const responseQuestion = async (req, res, next) => {
  try {
    const { question, mode = 'minlish' } = req.body; // default mode là minlish nếu không truyền mode

    if (!question)
      return res
        .status(400)
        .json({ success: false, message: 'Bắt buộc nhập câu hỏi' });

    const data = await responseQuestionService(question, mode);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
