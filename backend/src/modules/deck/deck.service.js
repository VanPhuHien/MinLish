import mongoose from 'mongoose';
import Deck from '../../models/deck.model.js';
import Topic from '../../models/topic.model.js';
import Card from '../../models/card.model.js';
import UserCardState from '../../models/userCardState.model.js';
import AppError from '../../utils/AppError.js';
import { generateSlug } from '../../utils/generate.js';

// Public deck endpoints serve the SYSTEM catalog only.
// A user's own decks are reached through /users/me/decks/*.
export const getDeckById = async (deckId) => {
  const deck = await Deck.findOne({
    _id: deckId,
    ownerType: 'system',
    status: 'published',
  });
  if (!deck) throw new AppError('Không tìm thấy deck', 404);

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
  if (!topic) throw new AppError('Không tìm thấy deck hoặc topic', 404);

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
    Deck.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
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
      .sort({ createdAt: -1 })
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
    throw new AppError(
      'Slug của deck đã tồn tại trong hệ thống. Vui lòng thay đổi slug hoặc title',
      400
    );
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
  if (!deck) throw new AppError('Không tìm thấy deck', 404);
  return deck;
};

export const updateAdminDeck = async (deckId, payload) => {
  const deck = await Deck.findById(deckId);
  if (!deck) throw new AppError('Không tìm thấy deck', 404);

  let slug = payload.slug;
  if (!payload.slug) {
    slug = generateSlug(payload.title);
  }

  const existing = await Deck.findOne({ slug, _id: { $ne: deckId } });
  if (existing) {
    throw new AppError(
      'Slug của deck đã tồn tại trong hệ thống. Vui lòng thay đổi slug hoặc title',
      400
    );
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
  if (!deck) throw new AppError('Không tìm thấy deck', 404);
  deck.status = 'archived';
  await deck.save();
  return deck;
};
