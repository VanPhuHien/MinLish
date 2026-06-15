import crypto from 'crypto';
import mongoose from 'mongoose';
import Deck from '../../models/deck.model.js';
import Topic from '../../models/topic.model.js';
import Card from '../../models/card.model.js';
import UserCardState from '../../models/userCardState.model.js';
import AppError from '../../utils/AppError.js';

const MAX_USER_DECKS = 3;

// Throws 404 if the deck is missing or not owned by this user.
const ensureOwnedDeck = async (userId, deckId) => {
  const deck = await Deck.findOne({
    _id: deckId,
    ownerType: 'user',
    ownerId: userId,
  });
  if (!deck) throw new AppError('Không tìm thấy deck', 404);
  return deck;
};

const buildSlug = (title) => {
  const base = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'deck'}-${crypto.randomBytes(4).toString('hex')}`;
};

export const listMyDecks = async (userId, filters) => {
  const { q, page, limit } = filters;

  const query = { ownerType: 'user', ownerId: userId };
  if (q) {
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

export const getMyDeckById = async (userId, deckId) => {
  const deck = await Deck.findOne({
    _id: deckId,
    ownerType: 'user',
    ownerId: userId,
  });
  if (!deck) throw new AppError('Không tìm thấy deck', 404);

  return deck;
};

export const updateMyDeck = async (userId, deckId, data) => {
  const update = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description;

  // Scope by owner so users can only update their own decks.
  const deck = await Deck.findOneAndUpdate(
    { _id: deckId, ownerType: 'user', ownerId: userId },
    { $set: update },
    { new: true }
  );
  if (!deck) throw new AppError('Không tìm thấy deck', 404);

  return deck;
};

export const deleteMyDeck = async (userId, deckId) => {
  const deck = await Deck.findOne({
    _id: deckId,
    ownerType: 'user',
    ownerId: userId,
  });
  if (!deck) throw new AppError('Không tìm thấy deck', 404);

  const cardIds = await Card.find({ deckId }).distinct('_id');

  await Promise.all([
    Card.deleteMany({ deckId }),
    Topic.deleteMany({ deckId }),
    UserCardState.deleteMany({ cardId: { $in: cardIds } }),
  ]);
  await deck.deleteOne();
};

export const getMyDeckTopics = async (userId, deckId) => {
  const deck = await ensureOwnedDeck(userId, deckId);

  const topics = await Topic.find({ deckId }).sort({ order: 1 });

  // Progress per topic in ONE aggregation (no N+1).
  // "learned" = any card the user has a state row for (hidden counts too).
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

export const createMyDeckTopic = async (userId, deckId, data) => {
  await ensureOwnedDeck(userId, deckId);

  // Auto-assign order = highest existing order + 1 (append to end).
  const last = await Topic.findOne({ deckId }).sort({ order: -1 }).select('order');
  const nextOrder = last ? last.order + 1 : 1;

  const topic = await Topic.create({
    deckId,
    name: data.name,
    slug: buildSlug(data.name),
    order: nextOrder,
    cardCount: 0,
  });

  await Deck.updateOne({ _id: deckId }, { $inc: { topicCount: 1 } });

  return topic;
};

export const createDeck = async (userId, data) => {
  const ownedCount = await Deck.countDocuments({
    ownerType: 'user',
    ownerId: userId,
  });
  if (ownedCount >= MAX_USER_DECKS) {
    throw new AppError(`Bạn chỉ được tạo tối đa ${MAX_USER_DECKS} bộ thẻ`, 400);
  }

  // User decks are personal and always published
  const deck = await Deck.create({
    title: data.title,
    description: data.description || '',
    slug: buildSlug(data.title),
    ownerType: 'user',
    ownerId: userId,
    status: 'published',
    publishedAt: new Date(),
  });

  return deck;
};
