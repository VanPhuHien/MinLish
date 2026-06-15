import crypto from 'crypto';
import Deck from '../../models/deck.model.js';
import AppError from '../../utils/AppError.js';

const MAX_USER_DECKS = 3;

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
