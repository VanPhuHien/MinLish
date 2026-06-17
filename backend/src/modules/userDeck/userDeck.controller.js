import { successResponse } from '../../utils/response.js';
import AppError from '../../utils/AppError.js';
import {
  createDeckSchema,
  updateDeckSchema,
  listMyDecksSchema,
  deckIdParamSchema,
  topicIdParamSchema,
  createTopicSchema,
  updateTopicSchema,
  cardIdParamSchema,
  listCardsSchema,
  createCardSchema,
  updateCardSchema,
} from './userDeck.validator.js';
import * as service from './userDeck.service.js';

export const listMyDeckCards = async (req, res, next) => {
  try {
    const paramResult = deckIdParamSchema.safeParse(req.params);
    const queryResult = listCardsSchema.safeParse(req.query);

    if (!paramResult.success || !queryResult.success) {
      const errors = [
        ...(paramResult.success ? [] : paramResult.error.errors),
        ...(queryResult.success ? [] : queryResult.error.errors),
      ].map((e) => ({ field: e.path.join('.'), message: e.message }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const data = await service.listMyDeckCards(
      req.user.id,
      paramResult.data.deckId,
      queryResult.data
    );

    return res
      .status(200)
      .json(successResponse('Lấy danh sách card thành công.', data));
  } catch (error) {
    next(error);
  }
};

export const getMyDeckCard = async (req, res, next) => {
  try {
    const result = cardIdParamSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const card = await service.getMyDeckCard(
      req.user.id,
      result.data.deckId,
      result.data.cardId
    );

    return res
      .status(200)
      .json(successResponse('Lấy chi tiết card thành công.', card));
  } catch (error) {
    next(error);
  }
};

export const updateMyDeckCard = async (req, res, next) => {
  try {
    const paramResult = cardIdParamSchema.safeParse(req.params);
    const bodyResult = updateCardSchema.safeParse(req.body);

    if (!paramResult.success || !bodyResult.success) {
      const errors = [
        ...(paramResult.success ? [] : paramResult.error.errors),
        ...(bodyResult.success ? [] : bodyResult.error.errors),
      ].map((e) => ({ field: e.path.join('.'), message: e.message }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const card = await service.updateMyDeckCard(
      req.user.id,
      paramResult.data.deckId,
      paramResult.data.cardId,
      bodyResult.data
    );

    return res
      .status(200)
      .json(successResponse('Cập nhật card thành công.', card));
  } catch (error) {
    next(error);
  }
};

export const deleteMyDeckCard = async (req, res, next) => {
  try {
    const result = cardIdParamSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    await service.deleteMyDeckCard(
      req.user.id,
      result.data.deckId,
      result.data.cardId
    );

    return res.status(200).json(successResponse('Xóa card thành công.', null));
  } catch (error) {
    next(error);
  }
};

export const createMyDeckCard = async (req, res, next) => {
  try {
    const paramResult = deckIdParamSchema.safeParse(req.params);
    const bodyResult = createCardSchema.safeParse(req.body);

    if (!paramResult.success || !bodyResult.success) {
      const errors = [
        ...(paramResult.success ? [] : paramResult.error.errors),
        ...(bodyResult.success ? [] : bodyResult.error.errors),
      ].map((e) => ({ field: e.path.join('.'), message: e.message }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const card = await service.createMyDeckCard(
      req.user.id,
      paramResult.data.deckId,
      bodyResult.data
    );

    return res.status(201).json(successResponse('Tạo card thành công.', card));
  } catch (error) {
    next(error);
  }
};

export const getMyDeckTopics = async (req, res, next) => {
  try {
    const result = deckIdParamSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const data = await service.getMyDeckTopics(req.user.id, result.data.deckId);

    return res
      .status(200)
      .json(successResponse('Lấy danh sách topic thành công.', data));
  } catch (error) {
    next(error);
  }
};

export const getMyDeckTopic = async (req, res, next) => {
  try {
    const result = topicIdParamSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const topic = await service.getMyDeckTopic(
      req.user.id,
      result.data.deckId,
      result.data.topicId
    );

    return res
      .status(200)
      .json(successResponse('Lấy chi tiết topic thành công.', topic));
  } catch (error) {
    next(error);
  }
};

export const updateMyDeckTopic = async (req, res, next) => {
  try {
    const paramResult = topicIdParamSchema.safeParse(req.params);
    const bodyResult = updateTopicSchema.safeParse(req.body);

    if (!paramResult.success || !bodyResult.success) {
      const errors = [
        ...(paramResult.success ? [] : paramResult.error.errors),
        ...(bodyResult.success ? [] : bodyResult.error.errors),
      ].map((e) => ({ field: e.path.join('.'), message: e.message }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const topic = await service.updateMyDeckTopic(
      req.user.id,
      paramResult.data.deckId,
      paramResult.data.topicId,
      bodyResult.data
    );

    return res
      .status(200)
      .json(successResponse('Cập nhật topic thành công.', topic));
  } catch (error) {
    next(error);
  }
};

export const deleteMyDeckTopic = async (req, res, next) => {
  try {
    const result = topicIdParamSchema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    await service.deleteMyDeckTopic(
      req.user.id,
      result.data.deckId,
      result.data.topicId
    );

    return res.status(200).json(successResponse('Xóa topic thành công.', null));
  } catch (error) {
    next(error);
  }
};

export const createMyDeckTopic = async (req, res, next) => {
  try {
    const paramResult = deckIdParamSchema.safeParse(req.params);
    const bodyResult = createTopicSchema.safeParse(req.body);

    if (!paramResult.success || !bodyResult.success) {
      const errors = [
        ...(paramResult.success ? [] : paramResult.error.errors),
        ...(bodyResult.success ? [] : bodyResult.error.errors),
      ].map((e) => ({ field: e.path.join('.'), message: e.message }));
      return next(new AppError('Dữ liệu không hợp lệ', 400, errors));
    }

    const topic = await service.createMyDeckTopic(
      req.user.id,
      paramResult.data.deckId,
      bodyResult.data
    );

    return res
      .status(201)
      .json(successResponse('Tạo topic thành công.', topic));
  } catch (error) {
    next(error);
  }
};

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

    return res.status(201).json(successResponse('Tạo deck thành công.', deck));
  } catch (error) {
    next(error);
  }
};
