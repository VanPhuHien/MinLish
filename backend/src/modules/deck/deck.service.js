import Deck from '../../models/deck.model.js';
import AppError from '../../utils/AppError.js';

export const getDeckById = async (deckId, userId) => {
  const accessClause = {
    $or: [{ ownerType: 'system', status: 'published' }, { ownerId: userId }],
  };

  const deck = await Deck.findOne({ _id: deckId, ...accessClause });
  if (!deck) throw new AppError('Không tìm thấy deck', 404);

  return deck;
};

export const listDecks = async (filters, userId) => {
  const { tagId, cefrLevelId, q, page, limit } = filters;

  // Owner clause: public system decks, plus all of the current user's decks.
  const publicClause = { ownerType: 'system', status: 'published' };
  const ownerClause = userId
    ? { $or: [publicClause, { ownerId: userId }] }
    : publicClause;

  // Filter clause from optional query params.
  const filterClause = {};
  if (tagId) filterClause.tagIds = tagId;
  if (cefrLevelId) filterClause.cefrLevelIds = cefrLevelId;
  if (q) {
    const regex = new RegExp(q, 'i');
    filterClause.$or = [{ title: regex }, { description: regex }];
  }

  // Combine with $and so the owner $or and the q $or don't collide.
  const query = { $and: [ownerClause, filterClause] };

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
