import { successResponse } from '../../utils/response.js';
import * as tagService from '../tag/tag.service.js';
import * as deckService from '../deck/deck.service.js';
import AppError from '../../utils/AppError.js';
import { ADMIN, COMMON } from '../../constants/codes/index.js';
import * as lessonService from '../lesson/lesson.service.js';

export const listTags = async (req, res, next) => {
  try {
    const levels = await tagService.listTags();
    return res
      .status(200)
      .json(successResponse(ADMIN.TAG_LIST_SUCCESS, levels));
  } catch (error) {
    next(error);
  }
};

export const getTagById = async (req, res, next) => {
  try {
    const level = await tagService.getTagById(req.params.id);
    return res
      .status(200)
      .json(successResponse(ADMIN.TAG_DETAIL_SUCCESS, level));
  } catch (error) {
    next(error);
  }
};

export const createTag = async (req, res, next) => {
  try {
    const level = await tagService.createTag(req.body);
    return res
      .status(201)
      .json(successResponse(ADMIN.TAG_CREATED_SUCCESS, level));
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (req, res, next) => {
  try {
    const level = await tagService.updateTag(req.params.id, req.body);
    return res
      .status(200)
      .json(successResponse(ADMIN.TAG_UPDATED_SUCCESS, level));
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    await tagService.deleteTag(req.params.id);
    return res.status(200).json(successResponse(ADMIN.TAG_DELETED_SUCCESS));
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
    return res.status(200).json(successResponse(ADMIN.DECK_LIST_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

export const createDeck = async (req, res, next) => {
  try {
    const deck = await deckService.createAdminDeck(req.body);
    return res
      .status(201)
      .json(successResponse(ADMIN.DECK_CREATED_SUCCESS, deck));
  } catch (error) {
    next(error);
  }
};

export const getDeckById = async (req, res, next) => {
  try {
    const deck = await deckService.getAdminDeckById(req.params.id);
    return res
      .status(200)
      .json(successResponse(ADMIN.DECK_DETAIL_SUCCESS, deck));
  } catch (error) {
    next(error);
  }
};

export const updateDeck = async (req, res, next) => {
  try {
    if (!req.body.title)
      next(
        new AppError(COMMON.INVALID_DATA, 400, [
          {
            field: 'title',
            message: 'The title field is required',
          },
        ])
      );
    const deck = await deckService.updateAdminDeck(req.params.id, req.body);
    return res
      .status(200)
      .json(successResponse(ADMIN.DECK_UPDATED_SUCCESS, deck));
  } catch (error) {
    next(error);
  }
};

export const deleteDeck = async (req, res, next) => {
  try {
    await deckService.deleteAdminDeck(req.params.id);
    return res.status(200).json(successResponse(ADMIN.DECK_DELETED_SUCCESS));
  } catch (error) {
    next(error);
  }
};

export const getDeckTopics = async (req, res, next) => {
  try {
    const topics = await deckService.getAdminDeckTopics(req.params.deckId);
    return res
      .status(200)
      .json(successResponse(ADMIN.TOPIC_LIST_SUCCESS, topics));
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
      .json(successResponse(ADMIN.TOPIC_CREATED_SUCCESS, topic));
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
      .json(successResponse(ADMIN.TOPIC_DETAIL_SUCCESS, topic));
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
      .json(successResponse(ADMIN.TOPIC_UPDATED_SUCCESS, topic));
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
    return res.status(200).json(successResponse(ADMIN.TOPIC_DELETED_SUCCESS));
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
    return res.status(200).json(successResponse(ADMIN.TOPIC_REORDERED_SUCCESS));
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
      pos: req.query.pos,
    };
    const data = await deckService.listAdminDeckCards(
      req.params.deckId,
      filters
    );
    return res.status(200).json(successResponse(ADMIN.CARD_LIST_SUCCESS, data));
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
      .json(successResponse(ADMIN.CARD_CREATED_SUCCESS, card));
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
      .json(successResponse(ADMIN.CARD_DETAIL_SUCCESS, card));
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
      .json(successResponse(ADMIN.CARD_UPDATED_SUCCESS, card));
  } catch (error) {
    next(error);
  }
};

export const deleteDeckCard = async (req, res, next) => {
  try {
    await deckService.deleteAdminDeckCard(req.params.deckId, req.params.cardId);
    return res.status(200).json(successResponse(ADMIN.CARD_DELETED_SUCCESS));
  } catch (error) {
    next(error);
  }
};

export const reorderTopicCards = async (req, res, next) => {
  try {
    await deckService.reorderAdminTopicCards(
      req.params.topicId,
      req.body.cards
    );
    return res.status(200).json(successResponse(ADMIN.CARD_REORDERED_SUCCESS));
  } catch (error) {
    next(error);
  }
};

export const listLessons = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      tagId: req.query.tagId,
      cefrLevelId: req.query.cefrLevelId,
      mode: req.query.mode,
      q: req.query.q,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };
    const data = await lessonService.listAdminLessons(filters);
    return res
      .status(200)
      .json(successResponse(ADMIN.LESSON_LIST_SUCCESS, data));
  } catch (error) {
    next(error);
  }
};

export const createLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.createAdminLesson(req.body);
    return res
      .status(201)
      .json(successResponse(ADMIN.LESSON_CREATED_SUCCESS, lesson));
  } catch (error) {
    next(error);
  }
};

export const getLessonById = async (req, res, next) => {
  try {
    const lesson = await lessonService.getAdminLessonById(req.params.lessonId);
    return res
      .status(200)
      .json(successResponse(ADMIN.LESSON_DETAIL_SUCCESS, lesson));
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.updateAdminLesson(
      req.params.lessonId,
      req.body
    );
    return res
      .status(200)
      .json(successResponse(ADMIN.LESSON_UPDATED_SUCCESS, lesson));
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (req, res, next) => {
  try {
    await lessonService.deleteAdminLesson(req.params.lessonId);
    return res.status(200).json(successResponse(ADMIN.LESSON_DELETED_SUCCESS));
  } catch (error) {
    next(error);
  }
};

export const publishLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.publishAdminLesson(req.params.lessonId);
    return res
      .status(200)
      .json(successResponse(ADMIN.LESSON_PUBLISHED_SUCCESS, lesson));
  } catch (error) {
    next(error);
  }
};

export const listLessonSegments = async (req, res, next) => {
  try {
    const segments = await lessonService.listAdminLessonSegments(
      req.params.lessonId
    );
    return res
      .status(200)
      .json(successResponse(ADMIN.SEGMENT_LIST_SUCCESS, segments));
  } catch (error) {
    next(error);
  }
};

export const createLessonSegment = async (req, res, next) => {
  try {
    const segment = await lessonService.createAdminLessonSegment(
      req.params.lessonId,
      req.body
    );
    return res
      .status(201)
      .json(successResponse(ADMIN.SEGMENT_CREATED_SUCCESS, segment));
  } catch (error) {
    next(error);
  }
};

export const getLessonSegmentById = async (req, res, next) => {
  try {
    const segment = await lessonService.getAdminLessonSegmentById(
      req.params.lessonId,
      req.params.segmentId
    );
    return res
      .status(200)
      .json(successResponse(ADMIN.SEGMENT_DETAIL_SUCCESS, segment));
  } catch (error) {
    next(error);
  }
};

export const updateLessonSegment = async (req, res, next) => {
  try {
    const segment = await lessonService.updateAdminLessonSegment(
      req.params.lessonId,
      req.params.segmentId,
      req.body
    );
    return res
      .status(200)
      .json(successResponse(ADMIN.SEGMENT_UPDATED_SUCCESS, segment));
  } catch (error) {
    next(error);
  }
};

export const deleteLessonSegment = async (req, res, next) => {
  try {
    await lessonService.deleteAdminLessonSegment(
      req.params.lessonId,
      req.params.segmentId
    );
    return res.status(200).json(successResponse(ADMIN.SEGMENT_DELETED_SUCCESS));
  } catch (error) {
    next(error);
  }
};
