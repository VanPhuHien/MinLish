import base from './base.js';

import authPaths from './paths/auth.path.js';
import deckPaths from './paths/deck.path.js';
import lessonPaths from './paths/lesson.path.js';
import userPaths from './paths/user.path.js';
import adminPaths from './paths/admin.path.js';

import securitySchemes from './components/securitySchemes.js';

import authSchemas from './schemas/auth.schema.js';
import commonSchemas from './schemas/common.schema.js';
import deckSchemas from './schemas/deck.schema.js';
import lessonSchemas from './schemas/lesson.schema.js';
import userSchemas from './schemas/user.schema.js';
import adminSchemas from './schemas/admin.schema.js';

import commonResponses from './responses/common.response.js';

export default {
  ...base,
  paths: {
    ...authPaths,
    ...deckPaths,
    ...lessonPaths,
    ...userPaths,
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
      ...adminSchemas,
    },
    responses: {
      ...commonResponses,
    },
  },
};
