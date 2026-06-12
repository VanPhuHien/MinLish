export default {
  '/users/me/lesson-progress': {
    get: {
      tags: ['Users'],
      summary: 'Lấy tiến độ bài học của người dùng hiện tại',
      description:
        'Lấy danh sách các tiến độ bài học (user_lesson_progress) của người dùng hiện tại, yêu cầu phải đăng nhập (gửi Bearer Token).',
      security: [
        {
          BearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: 'Lấy tiến độ bài học thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LessonProgressResponse',
              },
            },
          },
        },
        401: {
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
        403: {
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
        500: {
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
      },
    },
  },
};
