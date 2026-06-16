import mongoose from 'mongoose';
import Deck from '../../models/deck.model.js';
import Topic from '../../models/topic.model.js';
import Card from '../../models/card.model.js';
import UserCardState from '../../models/userCardState.model.js';
import AppError from '../../utils/AppError.js';

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
