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
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/ServerError',
        },
      },
    },
  },
  '/users/me/lessons/{lessonId}/segments-progress': {
    get: {
      tags: ['Users'],
      summary: 'Lấy tiến độ các segment của bài học',
      description:
        'Lấy danh sách tiến độ chi tiết từng segment (user_segment_progress) trong một bài học của người dùng hiện tại.',
      security: [
        {
          BearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID của bài học',
        },
      ],
      responses: {
        200: {
          description: 'Lấy tiến độ các segment thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SegmentProgressResponse',
              },
            },
          },
        },
        400: {
          description: 'ID bài học không hợp lệ',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'ID bài học không hợp lệ',
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/ServerError',
        },
      },
    },
  },
  '/users/me/card-states': {
    get: {
      tags: ['Users'],
      summary: 'Lấy trạng thái các thẻ từ vựng của người dùng hiện tại',
      description:
        'Lấy danh sách trạng thái học thẻ từ vựng (user_card_states) của người dùng hiện tại.',
      security: [
        {
          BearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: 'Lấy trạng thái thẻ từ vựng thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CardStatesResponse',
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        403: {
          $ref: '#/components/responses/Forbidden',
        },
        500: {
          $ref: '#/components/responses/ServerError',
        },
      },
    },
  },
};
