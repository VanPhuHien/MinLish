import base from './base.js';

import authPaths from './paths/auth.path.js';
import deckPaths from './paths/deck.path.js';
import lessonPaths from './paths/lesson.path.js';
import userPaths from './paths/user.path.js';
import userDeckPaths from './paths/userDeck.path.js';
import adminPaths from './paths/admin.path.js';

import securitySchemes from './components/securitySchemes.js';

import authSchemas from './schemas/auth.schema.js';
import commonSchemas from './schemas/common.schema.js';
import deckSchemas from './schemas/deck.schema.js';
import lessonSchemas from './schemas/lesson.schema.js';
import userSchemas from './schemas/user.schema.js';
import userDeckSchemas from './schemas/userDeck.schema.js';
import adminSchemas from './schemas/admin.schema.js';

import commonResponses from './responses/common.response.js';

export default {
  ...base,
  paths: {
    ...authPaths,
    ...deckPaths,
    ...lessonPaths,
    ...userPaths,
    ...userDeckPaths,
    ...adminPaths,
  },
  components: {
    securitySchemes,
    schemas: {
      ...commonSchemas,
      ...authSchemas,
      ...deckSchemas,
      ...lessonSchemas,
      ...userSchemas,
      ...userDeckSchemas,
      ...adminSchemas,
    },
    responses: {
      ...commonResponses,
    },
  },
};
