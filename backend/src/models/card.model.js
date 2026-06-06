import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "decks",
      required: true,
      index: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "topics",
      required: true,
      index: true,
    },
    order: { type: Number, required: true },
    term: { type: String, required: true, trim: true },
    pos: { type: String },
    audioUrl: {
      us: { type: String, default: null },
      uk: { type: String, default: null },
    },
    translation: { type: String, required: true, trim: true },
    explanation: {
      vi: { type: String, default: null },
      en: { type: String, default: null },
    },
    examples: {
      vi: { type: String, default: null },
      en: { type: String, default: null },
    },
    imageUrl: { type: String, default: null }
  },
  {
    timestamps: true,
  },
);

cardSchema.index({ topicId: 1, order: 1 }); //Compound Index giúp load list card theo thứ tự trong topic cực nhanh

export default mongoose.model("Card", cardSchema);
