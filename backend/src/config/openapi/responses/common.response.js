export default {
  Unauthorized: {
    description: 'Chưa đăng nhập hoặc token không hợp lệ',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          message: 'Chưa đăng nhập hoặc token không hợp lệ',
        },
      },
    },
  },
  Forbidden: {
    description: 'Không có quyền truy cập',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          message: 'Không có quyền truy cập',
        },
      },
    },
  },
  ServerError: {
    description: 'Lỗi server',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          success: false,
          message: 'Lỗi server',
        },
      },
    },
  },
};
