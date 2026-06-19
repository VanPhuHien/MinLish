import mongoose from 'mongoose';
import Card from '../../models/card.model.js';
import Topic from '../../models/topic.model.js';
import Deck from '../../models/deck.model.js';
import UserCardState from '../../models/userCardState.model.js';
import AppError from '../../utils/AppError.js';
import { VOCABULARY } from '../../constants/codes/index.js';

// Search published SYSTEM-deck vocabulary by term, to prefill the
// "create card" form. Returns a flat shape matching the create payload.
export const searchSystemVocabularyService = async ({ q, limit }) => {
  // Escape regex metacharacters to avoid ReDoS / injection.
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');

  const systemDeckIds = await Deck.find({
    ownerType: 'system',
    status: 'published',
  }).distinct('_id');

  const cards = await Card.find({
    deckId: { $in: systemDeckIds },
    term: regex,
  })
    .sort({ term: 1 })
    .limit(limit);

  return cards.map((c) => ({
    sourceCardId: c._id,
    term: c.term,
    translation: c.translation,
    pos: c.pos || '',
    definition: c.explanation?.vi || '',
    example: c.examples?.en || '',
  }));
};

export const getCardsByUserIdService = async (queryData, userId) => {
  const { deckId, topicId } = queryData;

  const query = {};
  if (deckId) query.deckId = deckId;
  if (topicId) query.topicId = topicId;

  const cards = await Card.find(query).sort({ order: 1 });

  if (!userId) {
    return cards.map((card) => ({
      card,
      userCardState: null,
    }));
  }

  const cardIds = cards.map((c) => c._id);
  const userCardStates = await UserCardState.find({
    userId,
    cardId: { $in: cardIds },
  });

  const stateMap = userCardStates.reduce((acc, state) => {
    acc[state.cardId.toString()] = state; //Dùng toString() vì ObjectId không so sánh trực tiếp bằng ===
    return acc;
  }, {});

  return cards.map((card) => ({
    card,
    userCardState: stateMap[card._id.toString()] || null,
  }));
};

export const createManualCardService = async (body) => {
  const {
    deckId,
    topicId,
    term,
    pos,
    translation,
    explanationVi,
    explanationEn,
    examplesVi,
    examplesEn,
    imageUrl,
    audioUsUrl,
    audioUkUrl,
  } = body;

  if (!deckId || !topicId || !term || !translation)
    throw new AppError(VOCABULARY.MISSING_REQUIRED_FIELDS, 400);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [deck, topic] = await Promise.all([
      Deck.findById(deckId).session(session),
      Topic.findById(topicId).session(session),
      //.session(session) nằm trong transaction;
      // do mặc định ngoài transaction
    ]);
    if (!deck) throw new AppError(VOCABULARY.DECK_NOT_FOUND, 404);

    if (!topic) throw new AppError(VOCABULARY.TOPIC_NOT_FOUND, 404);

    if (topic.deckId.toString() !== deck._id.toString())
      throw new AppError(VOCABULARY.TOPIC_NOT_IN_DECK, 400);

    const existingCard = await Card.findOne({
      topicId: topic._id,
      term: { $regex: new RegExp(`^${term}$`, 'i') },
      // ^: bắt đầu, $: kết thúc -> khớp hoàn toàn
      // i: Kiểm tra không phân biệt chữ hoa/thường -> case insesitive
      // -> vd: hello -> "Hello", "hello" hợp lệ
    }).session(session);

    if (existingCard)
      throw new AppError(
        VOCABULARY.VOCAB_ALREADY_EXISTS,
        409,
        [],
        `Vocabulary "${term}" already exists in this topic`
      ); // Conflict

    const lastCard = await Card.findOne({ topicId: topic._id })
      .sort({ order: -1 })
      .select('order')
      .session(session);
    const newCard = new Card({
      deckId: deck._id,
      topicId: topic._id,
      order: lastCard ? lastCard.order + 1 : 0,
      term,
      pos,
      translation,
      explanation: {
        vi: explanationVi?.trim() || null,
        en: explanationEn?.trim() || null,
      },
      examples: {
        vi: examplesVi?.trim() || null,
        en: examplesEn?.trim() || null,
      },
      imageUrl,
      audioUrl: {
        us: audioUsUrl,
        uk: audioUkUrl,
      },
    });

    await newCard.save({ session }); // await: Chờ MongoDB server xác nhận
    await Topic.updateOne(
      { _id: topic._id },
      { $inc: { cardCount: 1 } },
      { session }
    );
    await Deck.updateOne(
      { _id: deck._id },
      { $inc: { cardCount: 1 } },
      { session }
    );
    await session.commitTransaction();
    return newCard;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const updateCardService = async (cardId, updateData, currentUserId) => {
  const {
    term,
    translation,
    pos,
    explanationVi,
    explanationEn,
    examplesVi,
    examplesEn,
    imageUrl,
    audioUsUrl,
    audioUkUrl,
  } = updateData;

  const card = await Card.findById(cardId);
  if (!card) throw new AppError(VOCABULARY.VOCAB_NOT_FOUND, 404);

  const deck = await Deck.findById(card.deckId);
  if (!deck) throw new AppError(VOCABULARY.VOCAB_DECK_NOT_FOUND, 404);

  const topic = await Topic.findById(card.topicId);
  if (!topic) throw new AppError(VOCABULARY.VOCAB_TOPIC_NOT_FOUND, 404);

  if (topic.deckId.toString() !== deck._id.toString())
    throw new AppError(VOCABULARY.TOPIC_NOT_IN_DECK, 400);

  const isUserOwner =
    deck.ownerType === 'user' &&
    deck.ownerId.toString() === currentUserId.toString();

  if (!isUserOwner)
    throw new AppError(VOCABULARY.VOCAB_UPDATE_FORBIDDEN, 403);

  // Kiểm tra trùng term trong cùng topic (nếu có update term)
  if (term) {
    const duplicate = await Card.findOne({
      topicId: card.topicId,
      term,
      _id: { $ne: cardId }, // loại trừ chính card đang update
    });
    if (duplicate)
      throw new AppError(
        VOCABULARY.VOCAB_ALREADY_EXISTS,
        409,
        [],
        `Vocabulary "${term}" already exists in this topic`
      );
  }

  // Lọc undefined để tránh $set ghi undefined làm mất data trong MongoDB
  const setData = {
    ...(term !== undefined && { term }),
    ...(translation !== undefined && { translation }),
    ...(pos !== undefined && { pos }),
    ...(imageUrl !== undefined && { imageUrl }),
    explanation: {
      ...(explanationVi !== undefined && { vi: explanationVi?.trim() || null }),
      ...(explanationEn !== undefined && { en: explanationEn?.trim() || null }),
    },
    examples: {
      ...(examplesVi !== undefined && { vi: examplesVi?.trim() || null }),
      ...(examplesEn !== undefined && { en: examplesEn?.trim() || null }),
    },
    audioUrl: {
      ...(audioUsUrl !== undefined && { us: audioUsUrl }),
      ...(audioUkUrl !== undefined && { uk: audioUkUrl }),
    },
  };

  const updatedCard = await Card.findByIdAndUpdate(
    cardId,
    { $set: setData },
    { new: true }
  );

  return updatedCard;
};

export const deleteCardService = async (cardId, currentUserId) => {
  const card = await Card.findById(cardId);
  if (!card) throw new AppError(VOCABULARY.VOCAB_NOT_FOUND, 404);

  const deck = await Deck.findById(card.deckId);
  if (!deck) throw new AppError(VOCABULARY.VOCAB_DECK_NOT_FOUND, 404);

  const topic = await Topic.findById(card.topicId);
  if (!topic) throw new AppError(VOCABULARY.VOCAB_TOPIC_NOT_FOUND, 404);

  if (topic.deckId.toString() !== deck._id.toString())
    throw new AppError(VOCABULARY.TOPIC_NOT_IN_DECK, 400);

  const isUserOwner =
    deck.ownerType === 'user' &&
    deck.ownerId.toString() === currentUserId.toString();

  if (!isUserOwner) {
    throw new AppError(VOCABULARY.VOCAB_DELETE_FORBIDDEN, 403);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Xóa thẻ từ vựng
    await Card.findByIdAndDelete(cardId).session(session);

    // Giảm số lượng từ vựng ở Topic
    await Topic.updateOne(
      { _id: card.topicId },
      { $inc: { cardCount: -1 } },
      { session }
    );

    // Giảm số lượng từ vựng ở Deck
    await Deck.updateOne(
      { _id: card.deckId },
      { $inc: { cardCount: -1 } },
      { session }
    );

    await session.commitTransaction();
    return card;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
