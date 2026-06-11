import mongoose from 'mongoose';

const userDeckSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    tagIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    cefrLevelIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CefrLevel',
      },
    ],
    topicCount: {
      type: Number,
      default: 0,
    },
    cardCount: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const UserDeck =
  mongoose.models.UserDeck ||
  mongoose.model('UserDeck', userDeckSchema, 'userDecks');
export default UserDeck;
