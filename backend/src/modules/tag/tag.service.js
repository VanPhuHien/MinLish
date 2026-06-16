import Tag from '../../models/tag.model.js';
import Lesson from '../../models/lesson.model.js';
import Deck from '../../models/deck.model.js';

export const listTags = async ({ usedBy } = {}) => {
  // No filter show the full tag vocabulary.
  if (!usedBy) {
    return Tag.find().sort({ label: 1 });
  }

  let tagIds;
  if (usedBy === 'lesson') {
    tagIds = await Lesson.find({ status: 'published' }).distinct('tagIds');
  } else {
    tagIds = await Deck.find({
      ownerType: 'system',
      status: 'published',
    }).distinct('tagIds');
  }

  return Tag.find({ _id: { $in: tagIds } }).sort({ label: 1 });
};
