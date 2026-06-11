import { successResponse } from '../../utils/response.js';
import { getCardsSchema } from './vocabulary.validator.js';
import * as service from './vocabulary.service.js';
import User from '../../models/user.model.js';
import AppError from '../../utils/AppError.js';

export const getCardsByUserId = async (req, res, next) => {
  try {
    const result = getCardsSchema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    let userId = req.user?.uid;
    if (firebaseUid) {
      const user = await userRepository.findByFirebaseUid(firebaseUid);
      if (user) {
        userId = user._id;
      }
    }

    const cards = await service.getCardsByUserIdService(result.data, userId);
    res
      .status(200)
      .json(successResponse('Lấy danh sách thẻ thành công!', cards));
  } catch (error) {
    next(error);
  }
};

export const createManualCard = async (req, res, next) => {
  try {
    const newCard = await service.createManualCardService(req.body);
    res
      .status(201)
      .json(successResponse('Thêm thẻ từ vựng thành công!', newCard));
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);

    const updatedCard = await service.updateCardService(
      req.params.cardId,
      req.body,
      user._id
    );
    return res
      .status(200)
      .json(successResponse('Cập nhật từ vựng thành công.', updatedCard));
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);

    await service.deleteCardService(req.params.cardId, user._id);
    return res
      .status(200)
      .json(successResponse('Xóa từ vựng thành công.', null));
  } catch (error) {
    next(error);
  }
};
