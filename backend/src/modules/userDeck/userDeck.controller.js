import { successResponse } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import {
  createDeckSchema,
  updateDeckSchema,
  listMyDecksSchema,
  deckIdParamSchema,
} from './userDeck.validator.js';
import * as service from './userDeck.service.js';

export const deleteMyDeck = async (req, res, next) => {
  try {
    const result = deckIdParamSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    await service.deleteMyDeck(req.user.id, result.data.deckId);

    return res.status(200).json(successResponse('Xóa deck thành công.', null));
  } catch (error) {
    next(error);
  }
};

export const updateMyDeck = async (req, res, next) => {
  try {
    const paramResult = deckIdParamSchema.safeParse(req.params);
    const bodyResult = updateDeckSchema.safeParse(req.body);

    if (!paramResult.success || !bodyResult.success) {
      const errors = [
        ...(paramResult.success ? [] : paramResult.error.errors),
        ...(bodyResult.success ? [] : bodyResult.error.errors),
      ].map((e) => ({ field: e.path.join('.'), message: e.message }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const deck = await service.updateMyDeck(
      req.user.id,
      paramResult.data.deckId,
      bodyResult.data
    );

    return res
      .status(200)
      .json(successResponse('Cập nhật deck thành công.', deck));
  } catch (error) {
    next(error);
  }
};

export const getMyDeckById = async (req, res, next) => {
  try {
    const result = deckIdParamSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const deck = await service.getMyDeckById(req.user.id, result.data.deckId);

    return res
      .status(200)
      .json(successResponse('Lấy chi tiết deck thành công.', deck));
  } catch (error) {
    next(error);
  }
};

export const listMyDecks = async (req, res, next) => {
  try {
    const result = listMyDecksSchema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const data = await service.listMyDecks(req.user.id, result.data);

    return res
      .status(200)
      .json(successResponse('Lấy danh sách deck của bạn thành công.', data));
  } catch (error) {
    next(error);
  }
};

export const createDeck = async (req, res, next) => {
  try {
    const result = createDeckSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const deck = await service.createDeck(req.user.id, result.data);

    return res
      .status(201)
      .json(successResponse('Tạo deck thành công.', deck));
  } catch (error) {
    next(error);
  }
};
