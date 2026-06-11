import mongoose from 'mongoose';

const userTopicSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserDeck',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
    cardCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const UserTopic =
  mongoose.models.UserTopic ||
  mongoose.model('UserTopic', userTopicSchema, 'userTopics');
export default Topic;
