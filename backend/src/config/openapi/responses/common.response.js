export default {
  BadRequest: {
    description: 'Invalid request data',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          code: 'INVALID_DATA',
          message: 'Invalid request data',
        },
      },
    },
  },
  Unauthorized: {
    description: 'Not authenticated or token is invalid',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Not authenticated or token is invalid',
        },
      },
    },
  },
  Forbidden: {
    description: 'You do not have permission to access this resource',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource',
        },
      },
    },
  },
  ServerError: {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      },
    },
  },
};
