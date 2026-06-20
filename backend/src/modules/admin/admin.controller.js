import { successResponse } from '../../utils/response.js';
import * as tagService from '../tag/tag.service.js';
import * as deckService from '../deck/deck.service.js';
import AppError from '../../utils/AppError.js';

export const listTags = async (req, res, next) => {
  try {
    const levels = await tagService.listTags();
    return res
      .status(200)
      .json(successResponse('Lấy danh sách tags thành công', levels));
  } catch (error) {
    next(error);
  }
};

export const getTagById = async (req, res, next) => {
  try {
    const level = await tagService.getTagById(req.params.id);
    return res
      .status(200)
      .json(successResponse('Lấy chi tiết tag thành công', level));
  } catch (error) {
    next(error);
  }
};

export const createTag = async (req, res, next) => {
  try {
    const level = await tagService.createTag(req.body);
    return res
      .status(201)
      .json(successResponse('Tạo mới tag thành công', level));
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (req, res, next) => {
  try {
    const level = await tagService.updateTag(req.params.id, req.body);
    return res
      .status(200)
      .json(successResponse('Cập nhật tag thành công', level));
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    await tagService.deleteTag(req.params.id);
    return res.status(200).json(successResponse('Xóa tag thành công'));
  } catch (error) {
    next(error);
  }
};

export const listDecks = async (req, res, next) => {
  try {
    const filters = {
      tagId: req.query.tagId,
      cefrLevelId: req.query.cefrLevelId,
      q: req.query.q,
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      // parseInt thành công trả về số nguyên, ko thì NaN -> NaN || 1 = 1
      limit: parseInt(req.query.limit) || 10,
    };
    const data = await deckService.listAdminDecks(filters);
    return res
      .status(200)
      .json(successResponse('Lấy danh sách deck thành công', data));
  } catch (error) {
    next(error);
  }
};

export const createDeck = async (req, res, next) => {
  try {
    const deck = await deckService.createAdminDeck(req.body);
    return res.status(201).json(successResponse('Tạo deck thành công', deck));
  } catch (error) {
    next(error);
  }
};

export const getDeckById = async (req, res, next) => {
  try {
    const deck = await deckService.getAdminDeckById(req.params.id);
    return res
      .status(200)
      .json(successResponse('Lấy chi tiết deck thành công', deck));
  } catch (error) {
    next(error);
  }
};

export const updateDeck = async (req, res, next) => {
  try {
    if (!req.body.title)
      next(
        new AppError('Dữ liệu không hợp lệ', 400, [
          {
            field: 'title',
            message: 'Trường title là bắt buộc',
          },
        ])
      );
    const deck = await deckService.updateAdminDeck(req.params.id, req.body);
    return res
      .status(200)
      .json(successResponse('Cập nhật deck thành công', deck));
  } catch (error) {
    next(error);
  }
};

export const deleteDeck = async (req, res, next) => {
  try {
    await deckService.deleteAdminDeck(req.params.id);
    return res.status(200).json(successResponse('Xóa deck thành công'));
  } catch (error) {
    next(error);
  }
};

export const getDeckTopics = async (req, res, next) => {
  try {
    const topics = await deckService.getAdminDeckTopics(req.params.deckId);
    return res
      .status(200)
      .json(successResponse('Lấy danh sách topic thành công', topics));
  } catch (error) {
    next(error);
  }
};

export const createDeckTopic = async (req, res, next) => {
  try {
    const topic = await deckService.createAdminDeckTopic(
      req.params.deckId,
      req.body
    );
    return res
      .status(201)
      .json(successResponse('Tạo mới topic thành công', topic));
  } catch (error) {
    next(error);
  }
};

export const getDeckTopicById = async (req, res, next) => {
  try {
    const topic = await deckService.getAdminDeckTopic(
      req.params.deckId,
      req.params.topicId
    );
    return res
      .status(200)
      .json(successResponse('Lấy chi tiết topic thành công', topic));
  } catch (error) {
    next(error);
  }
};

export const updateDeckTopic = async (req, res, next) => {
  try {
    const topic = await deckService.updateAdminDeckTopic(
      req.params.deckId,
      req.params.topicId,
      req.body
    );
    return res
      .status(200)
      .json(successResponse('Cập nhật topic thành công', topic));
  } catch (error) {
    next(error);
  }
};

export const deleteDeckTopic = async (req, res, next) => {
  try {
    await deckService.deleteAdminDeckTopic(
      req.params.deckId,
      req.params.topicId
    );
    return res.status(200).json(successResponse('Xóa topic thành công'));
  } catch (error) {
    next(error);
  }
};

export const reorderDeckTopics = async (req, res, next) => {
  try {
    await deckService.reorderAdminDeckTopics(
      req.params.deckId,
      req.body.topics
    );
    return res.status(200).json(successResponse('Sắp xếp topic thành công'));
  } catch (error) {
    next(error);
  }
};

export const listDeckCards = async (req, res, next) => {
  try {
    const filters = {
      topicId: req.query.topicId,
      q: req.query.q,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };
    const data = await deckService.listAdminDeckCards(
      req.params.deckId,
      filters
    );
    return res
      .status(200)
      .json(successResponse('Lấy danh sách card thành công', data));
  } catch (error) {
    next(error);
  }
};

export const createDeckCard = async (req, res, next) => {
  try {
    const card = await deckService.createAdminDeckCard(
      req.params.deckId,
      req.body
    );
    return res
      .status(201)
      .json(successResponse('Tạo mới card thành công', card));
  } catch (error) {
    next(error);
  }
};

export const getDeckCardById = async (req, res, next) => {
  try {
    const card = await deckService.getAdminDeckCard(
      req.params.deckId,
      req.params.cardId
    );
    return res
      .status(200)
      .json(successResponse('Lấy chi tiết card thành công', card));
  } catch (error) {
    next(error);
  }
};

export const updateDeckCard = async (req, res, next) => {
  try {
    const card = await deckService.updateAdminDeckCard(
      req.params.deckId,
      req.params.cardId,
      req.body
    );
    return res
      .status(200)
      .json(successResponse('Cập nhật card thành công', card));
  } catch (error) {
    next(error);
  }
};

export const deleteDeckCard = async (req, res, next) => {
  try {
    await deckService.deleteAdminDeckCard(req.params.deckId, req.params.cardId);
    return res.status(200).json(successResponse('Xóa card thành công'));
  } catch (error) {
    next(error);
  }
};
