import { successResponse } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import {
  getDeckSchema,
  getTopicCardsSchema,
  listDecksSchema,
} from './deck.validator.js';
import * as service from './deck.service.js';

export const getDeckById = async (req, res, next) => {
  try {
    const result = getDeckSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const userId = req.user.id;
    const deck = await service.getDeckById(result.data.deckId, userId);

    return res
      .status(200)
      .json(successResponse('Lấy chi tiết deck thành công.', deck));
  } catch (error) {
    next(error);
  }
};

export const getDeckTopics = async (req, res, next) => {
  try {
    const result = getDeckSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const userId = req.user.id;
    const data = await service.getDeckTopics(result.data.deckId, userId);

    return res
      .status(200)
      .json(
        successResponse('Lấy danh sách topic trong deck thành công.', data)
      );
  } catch (error) {
    next(error);
  }
};

export const getTopicCards = async (req, res, next) => {
  try {
    const result = getTopicCardsSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const userId = req.user.id;
    const { deckId, topicId } = result.data;
    const data = await service.getTopicCards(deckId, topicId, userId);

    return res
      .status(200)
      .json(
        successResponse('Lấy danh sách card trong topic thành công.', data)
      );
  } catch (error) {
    next(error);
  }
};

export const listDecks = async (req, res, next) => {
  try {
    const result = listDecksSchema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const userId = req.user?.id ?? null;
    const data = await service.listDecks(result.data, userId);

    return res
      .status(200)
      .json(successResponse('Lấy danh sách deck thành công.', data));
  } catch (error) {
    next(error);
  }
};
