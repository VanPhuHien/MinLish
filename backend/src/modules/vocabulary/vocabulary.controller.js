import { successResponse } from '../../utils/response.js';
import {
  getCardsSchema,
  searchVocabularySchema,
} from './vocabulary.validator.js';
import * as service from './vocabulary.service.js';
import User from '../../models/user.model.js';
import AppError from '../../utils/AppError.js';
import { VOCABULARY, COMMON } from '../../constants/codes/index.js';

export const searchVocabulary = async (req, res, next) => {
  try {
    const result = searchVocabularySchema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(COMMON.INVALID_DATA, 400, errors));
    }

    const results = await service.searchSystemVocabularyService(result.data);
    return res
      .status(200)
      .json(successResponse(VOCABULARY.VOCAB_SEARCH_SUCCESS, results));
  } catch (error) {
    next(error);
  }
};

export const getCardsByUserId = async (req, res, next) => {
  try {
    const result = getCardsSchema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(COMMON.INVALID_DATA, 400, errors));
    }

    const firebaseUid = req.user?.uid;
    let userId = null;
    if (firebaseUid) {
      const user = await userRepository.findByFirebaseUid(firebaseUid);
      if (user) {
        userId = user._id;
      }
    }

    const cards = await service.getCardsByUserIdService(result.data, userId);
    res
      .status(200)
      .json(successResponse(VOCABULARY.VOCAB_CARD_LIST_SUCCESS, cards));
  } catch (error) {
    next(error);
  }
};

export const createManualCard = async (req, res, next) => {
  try {
    const newCard = await service.createManualCardService(req.body);
    res
      .status(201)
      .json(successResponse(VOCABULARY.VOCAB_CARD_CREATE_SUCCESS, newCard));
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) throw new AppError(VOCABULARY.USER_NOT_FOUND, 404);

    const updatedCard = await service.updateCardService(
      req.params.cardId,
      req.body,
      user._id
    );
    return res
      .status(200)
      .json(successResponse(VOCABULARY.VOCAB_CARD_UPDATE_SUCCESS, updatedCard));
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) throw new AppError(VOCABULARY.USER_NOT_FOUND, 404);

    await service.deleteCardService(req.params.cardId, user._id);
    return res
      .status(200)
      .json(successResponse(VOCABULARY.VOCAB_CARD_DELETE_SUCCESS, null));
  } catch (error) {
    next(error);
  }
};
