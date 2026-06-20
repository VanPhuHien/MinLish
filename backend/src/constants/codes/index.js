import { COMMON, COMMON_MESSAGES } from './common.codes.js';
import { AUTH, AUTH_MESSAGES } from './auth.codes.js';
import { CEFR, CEFR_MESSAGES } from './cefr.codes.js';
import { TAG, TAG_MESSAGES } from './tag.codes.js';
import { LESSON, LESSON_MESSAGES } from './lesson.codes.js';
import { FILE, FILE_MESSAGES } from './file.codes.js';
import { DECK, DECK_MESSAGES } from './deck.codes.js';
import { USER_DECK, USER_DECK_MESSAGES } from './userDeck.codes.js';
import { VOCABULARY, VOCABULARY_MESSAGES } from './vocabulary.codes.js';
import { ADMIN, ADMIN_MESSAGES } from './admin.codes.js';

export {
  COMMON,
  AUTH,
  CEFR,
  TAG,
  LESSON,
  FILE,
  DECK,
  USER_DECK,
  VOCABULARY,
  ADMIN,
};


export const MESSAGES = {
  ...COMMON_MESSAGES,
  ...AUTH_MESSAGES,
  ...CEFR_MESSAGES,
  ...TAG_MESSAGES,
  ...LESSON_MESSAGES,
  ...FILE_MESSAGES,
  ...DECK_MESSAGES,
  ...USER_DECK_MESSAGES,
  ...VOCABULARY_MESSAGES,
  ...ADMIN_MESSAGES,
};
