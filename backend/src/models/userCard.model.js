import mongoose from 'mongoose';
import { Phonetic } from './card.model';

const userCardSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserDeck',
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserTopic',
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    term: {
      type: String,
      required: true,
      trim: true,
    },
    pos: {
      type: String,
      required: true,
      trim: true,
    },
    phonetics: [Phonetic],
    translation: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      vi: {
        type: String,
        default: '',
      },
      en: {
        type: String,
        default: '',
      },
    },
    examples: {
      vi: {
        type: String,
        default: '',
      },
      en: {
        type: String,
        default: '',
      },
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const UserCard =
  mongoose.models.UserCard ||
  mongoose.model('UserCard', userCardSchema, 'userCards');
// Tránh OverwriteModelError do Next.js có cơ chế Hot Reload - mỗi lần save file, module được load lại
// 'UserCard': Tên model - dùng để tra cứu trong mongoose.models
// userCardSchema: Schema - cấu trúc document
// 'userCards: là tên collection trong MongoDB - nếu không truyền, Mongoose tự đặt thành usercards
export default Card;
