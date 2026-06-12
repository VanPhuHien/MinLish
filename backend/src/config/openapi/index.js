import base from './base.js';

import authPaths from './paths/auth.path.js';
import userPaths from './paths/user.path.js';
import adminPaths from './paths/admin.path.js';

import authSchemas from './schemas/auth.schema.js';
import commonSchemas from './schemas/common.schema.js';
import userSchemas from './schemas/user.schema.js';
import adminSchemas from './schemas/admin.schema.js';

import commonResponses from './responses/common.response.js';

export default {
  ...base,
  paths: {
    ...authPaths,
    ...userPaths,
    ...adminPaths,
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Access Token: Bearer <Token>',
      },
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'Refresh Token lưu dưới dạng HTTP-only Cookie',
      },
    },
    schemas: {
      ...commonSchemas,
      ...authSchemas,
      ...userSchemas,
      ...adminSchemas,
    },
    responses: {
      ...commonResponses,
    },
  },
};
