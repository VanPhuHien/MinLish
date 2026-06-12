import base from './base.js';

import authPaths from './paths/auth.path.js';
import userPaths from './paths/user.path.js';

import authSchemas from './schemas/auth.schema.js';
import commonSchemas from './schemas/common.schema.js';
import userSchemas from './schemas/user.schema.js';

export default {
  ...base,
  paths: {
    ...authPaths,
    ...userPaths,
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
    },
  },
};
