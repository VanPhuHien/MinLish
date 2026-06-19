import mongoose from 'mongoose';
import Deck from '../../models/deck.model.js';
import Topic from '../../models/topic.model.js';
import Card from '../../models/card.model.js';
import UserCardState from '../../models/userCardState.model.js';
import AppError from '../../utils/AppError.js';
import { DECK, COMMON } from '../../constants/codes/index.js';
import { generateSlug } from '../../utils/generate.js';

// Public deck endpoints serve the SYSTEM catalog only.
// A user's own decks are reached through /users/me/decks/*.
export const getDeckById = async (deckId) => {
  const deck = await Deck.findOne({
    _id: deckId,
    ownerType: 'system',
    status: 'published',
  });
  if (!deck) throw new AppError(DECK.DECK_NOT_FOUND, 404);

  return deck;
};

export const getDeckTopics = async (deckId, userId) => {
  // Reuse access check; throws 404 if deck not accessible.
  const deck = await getDeckById(deckId);

  const topics = await Topic.find({ deckId }).sort({ order: 1 });

  // Progress per topic in ONE aggregation. Solve N+1 query problem.
  // "learned" = card the user has any state for. A hidden card still counts.
  // Aggregate does NOT auto-cast strings to ObjectId — cast explicitly.
  const progressRows = await UserCardState.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        deckId: new mongoose.Types.ObjectId(deckId),
      },
    },
    { $group: { _id: '$topicId', learnedCardCount: { $sum: 1 } } },
  ]);

  // Map topicId -> learnedCardCount for O(1) merge.
  const learnedMap = progressRows.reduce((acc, row) => {
    acc[row._id.toString()] = row.learnedCardCount;
    return acc;
  }, {});

  const items = topics.map((topic) => {
    const learnedCardCount = learnedMap[topic._id.toString()] || 0;
    const totalCardCount = topic.cardCount;
    const progressPct =
      totalCardCount > 0
        ? Math.round((learnedCardCount / totalCardCount) * 100)
        : 0;

    return {
      topic,
      userProgress: { learnedCardCount, totalCardCount, progressPct },
    };
  });

  return { deck, topics: items };
};

export const getTopicCards = async (deckId, topicId, userId) => {
  // Reuse access check; throws 404 if deck not accessible.
  await getDeckById(deckId);

  // Topic must belong to this deck.
  const topic = await Topic.findOne({ _id: topicId, deckId });
  if (!topic) throw new AppError(DECK.DECK_OR_TOPIC_NOT_FOUND, 404);

  const cards = await Card.find({ deckId, topicId }).sort({ order: 1 });

  // Fetch user's states for these cards, then merge by cardId (O(1) lookup).
  const cardIds = cards.map((c) => c._id);
  const userCardStates = await UserCardState.find({
    userId,
    cardId: { $in: cardIds },
  });

  const stateMap = userCardStates.reduce((acc, state) => {
    acc[state.cardId.toString()] = state;
    return acc;
  }, {});

  const items = cards.map((card) => ({
    card,
    userCardState: stateMap[card._id.toString()] || null,
  }));

  return { cards: items };
};

export const listDecks = async (filters) => {
  const { tagId, cefrLevelId, q, page, limit } = filters;

  // Public catalog = system published decks only.
  const query = { ownerType: 'system', status: 'published' };
  if (tagId) query.tagIds = tagId;
  if (cefrLevelId) query.cefrLevelIds = cefrLevelId;
  if (q) {
    // Escape regex metacharacters to avoid ReDoS / injection.
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    query.$or = [{ title: regex }, { description: regex }];
  }

  const skip = (page - 1) * limit;
  const [decks, totalItems] = await Promise.all([
    Deck.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
    Deck.countDocuments(query),
  ]);

  return {
    decks,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};

export const listAdminDecks = async (filters) => {
  const { tagId, cefrLevelId, q, page, limit } = filters;

  const query = {};
  if (tagId) query.tagIds = tagId;
  if (cefrLevelId) query.cefrLevelIds = cefrLevelId;
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // /[.*+?^${}()|[\]\\]/g
    // - regex dùng để bắt các ký tự đặc biệt
    // - [] : nhóm ký tự cần tìm
    // - \ : escape
    // - g : global -> thay tất cả, không chỉ lần đầu
    // \\$&
    // - \\ -> tạo ra một dấu \
    // - $& -> đại diện cho ký tự vừa match
    // + -> \+ thay vì + = lặp 1 hoặc nhiều lần, * = lặp 0 hoặc nhiều lần theo cách hiểu của regex

    const regex = new RegExp(escaped, 'i');
    query.$or = [{ title: regex }, { description: regex }];
  }

  const skip = (page - 1) * limit; // Tính số lượng bản ghi cần bỏ qua khi phân trang
  // vd: const page = 3; const limit = 10;
  // const skip = (page - 1) * limit = 20;
  // -> trang 1 bỏ qua 0 record, trang 2 bỏ qua 10 record

  const [decks, totalItems] = await Promise.all([
    Deck.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('tagIds', 'label code') //có kèm id tag nếu ko -_id
      .populate('cefrLevelIds', 'label code'),
    Deck.countDocuments(query), // Số lượng deck khớp với điều kiện query
  ]);
  return {
    decks,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};

export const createAdminDeck = async (payload) => {
  let slug = payload.slug;
  if (!payload.slug) slug = generateSlug(payload.title);
  const existing = await Deck.findOne({ slug });
  if (existing) {
    throw new AppError(DECK.DECK_SLUG_EXISTS, 400);
  }

  const newDeck = new Deck({
    ...payload,
    slug,
    ownerType: 'system',
    status: payload.status || 'draft',
  });
  if (newDeck.status === 'published') {
    newDeck.publishedAt = new Date();
  }
  await newDeck.save();
  return newDeck;
};

export const getAdminDeckById = async (deckId) => {
  const deck = await Deck.findById(deckId)
    .populate('tagIds', 'label code')
    .populate('cefrLevelIds', 'label code');
  if (!deck) throw new AppError(DECK.DECK_NOT_FOUND, 404);
  return deck;
};

export const updateAdminDeck = async (deckId, payload) => {
  const deck = await Deck.findById(deckId);
  if (!deck) throw new AppError(DECK.DECK_NOT_FOUND, 404);

  let slug = payload.slug;
  if (!payload.slug) {
    slug = generateSlug(payload.title);
  }

  const existing = await Deck.findOne({ slug, _id: { $ne: deckId } });
  if (existing) {
    throw new AppError(DECK.DECK_SLUG_EXISTS, 400);
  }

  const oldStatus = deck.status;
  Object.assign(deck, payload);
  deck.slug = slug;
  if (payload.status === 'published' && oldStatus !== 'published') {
    deck.publishedAt = new Date();
  }
  await deck.save();
  return deck;
};

export const deleteAdminDeck = async (deckId) => {
  const deck = await Deck.findById(deckId);
  if (!deck) throw new AppError(DECK.DECK_NOT_FOUND, 404);
  deck.status = 'archived';
  await deck.save();
  return deck;
};

export const getAdminDeckTopics = async (deckId) => {
  const deck = await Deck.findById(deckId);
  if (!deck) throw new AppError(DECK.DECK_NOT_FOUND, 404);
  const topics = await Topic.find({ deckId }).sort({ order: 1 });
  return topics;
};

export const createAdminDeckTopic = async (deckId, data) => {
  const deck = await Deck.findById(deckId);
  if (!deck) throw new AppError(DECK.DECK_NOT_FOUND, 404);

  if (!data.name)
    throw new AppError(DECK.TOPIC_NAME_REQUIRED, 400, [
      {
        field: 'name',
        message: 'The name field is required',
      },
    ]);

  const last = await Topic.findOne({ deckId })
    .sort({ order: -1 })
    .select('order');
  const nextOrder = last ? last.order + 1 : 1;
  let slug = data.slug;
  if (!data.slug) slug = generateSlug(data.name);
  const existing = await Topic.findOne({ deckId, slug });
  if (existing)
    throw new AppError(DECK.TOPIC_SLUG_EXISTS, 409, [
      {
        field: 'slug',
        message: 'Topic slug already exists. Please change the slug or title',
      },
    ]);

  const topic = await Topic.create({
    deckId,
    name: data.name,
    slug,
    order: nextOrder,
    cardCount: 0,
  });
  await Deck.updateOne({ _id: deckId }, { $inc: { topicCount: 1 } });
  return topic;
};

export const getAdminDeckTopic = async (deckId, topicId) => {
  const topic = await Topic.findOne({ _id: topicId, deckId });
  if (!topic) throw new AppError(DECK.DECK_OR_TOPIC_NOT_FOUND, 404);
  return topic;
};

export const updateAdminDeckTopic = async (deckId, topicId, data) => {
  const topic = await Topic.findOne({ _id: topicId, deckId });
  if (!topic) throw new AppError(DECK.DECK_OR_TOPIC_NOT_FOUND, 404);

  let slug = data.slug;
  if (!data.slug) slug = generateSlug(data.name);
  const existing = await Topic.findOne({ deckId, slug, _id: { $ne: topicId } });
  if (existing)
    throw new AppError(DECK.TOPIC_SLUG_EXISTS, 409, [
      {
        field: 'slug',
        message: 'Topic slug already exists. Please change the slug or title',
      },
    ]);
  topic.slug = slug;

  if (data.name) topic.name = data.name;
  else
    throw new AppError(DECK.TOPIC_NAME_REQUIRED, 400, [
      {
        field: 'name',
        message: 'The name field is required',
      },
    ]);
  await topic.save();
  return topic;
};

export const deleteAdminDeckTopic = async (deckId, topicId) => {
  const topic = await Topic.findOne({ _id: topicId, deckId });
  if (!topic) throw new AppError(DECK.DECK_OR_TOPIC_NOT_FOUND, 404);

  const cardIds = await Card.find({ deckId, topicId }).distinct('_id');
  // distinct('_id') trả về mảng thuần:
  // [ ObjectId("66a..."), ObjectId("66b...")]
  // find().select('_id') trả về mảng document:
  // [ { _id: ObjectId("66a...") }, { _id: ObjectId("66b...") }]

  await Promise.all([
    Card.deleteMany({ deckId, topicId }),
    UserCardState.deleteMany({ cardId: { $in: cardIds } }),
  ]);
  await topic.deleteOne();
  await Deck.updateOne(
    { _id: deckId },
    { $inc: { topicCount: -1, cardCount: -cardIds.length } }
  );
};

export const reorderAdminDeckTopics = async (deckId, topics) => {
  const errors = [];
  if (!Array.isArray(topics) || topics.length === 0) {
    errors.push({
      field: 'topics',
      message: 'The topics field must be a non-empty array',
    });
  } else {
    topics.forEach((item, index) => {
      if (!item.topicId) {
        errors.push({
          field: `topics[${index}].topicId`,
          message: 'The topicId field is required',
        });
      }
      if (!item.order || !Number.isInteger(item.order) || item.order < 1) {
        errors.push({
          field: `topics[${index}].order`,
          message: 'The order field is required and must be an integer >= 1',
        });
      }
    });
  }

  if (errors.length > 0) {
    throw new AppError(COMMON.INVALID_DATA, 400, errors);
  }

  const deck = await Deck.findById(deckId);
  if (!deck) throw new AppError(DECK.DECK_NOT_FOUND, 404);

  const bulkOps = topics.map(({ topicId, order }) => ({
    updateOne: {
      filter: { _id: topicId, deckId },
      // deckId là để kiểm tra deck này có đúng là chứa topic này không, tránh giả deckId
      update: { $set: { order } },
    },
  }));
  if (bulkOps.length > 0) {
    await Topic.bulkWrite(bulkOps); // Chạy tất cả update trong một lần gọi MongoDB
  }
};
