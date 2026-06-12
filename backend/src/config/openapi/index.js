import base from './base.js';

import authPaths from './paths/auth.path.js';

import authSchemas from './schemas/auth.schema.js';
import commonSchemas from './schemas/common.schema.js';

export default {
  ...base,
  paths: {
    ...authPaths,
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
    },
  },
};
