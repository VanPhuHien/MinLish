const CardStateNotFound = {
  description: 'Không tìm thấy user card state',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        message: 'Không tìm thấy user card state',
      },
    },
  },
};

const CardStateBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        MissingFields: {
          summary: 'Thiếu dữ liệu trường bắt buộc',
          value: {
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: [
              { field: 'deckId', message: 'Trường deckId là bắt buộc' },
              { field: 'topicId', message: 'Trường topicId là bắt buộc' },
            ],
          },
        },
        InvalidGrade: {
          summary: 'Điểm đánh giá không hợp lệ',
          value: {
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: [
              {
                field: 'srs.lastGrade',
                message: 'Trường lastGrade phải là số nguyên từ 0 đến 3',
              },
            ],
          },
        },
      },
    },
  },
};

const CardStatePatchBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        InvalidGrade: {
          summary: 'Điểm đánh giá không hợp lệ',
          value: {
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: [
              {
                field: 'srs.lastGrade',
                message: 'Trường lastGrade phải là số nguyên từ 0 đến 3',
              },
            ],
          },
        },
      },
    },
  },
};

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
      tags: ['User Card States'],
      summary: 'Lấy danh sách user card states',
      description:
        'Lấy danh sách các user card states (trạng thái học thẻ từ) của người dùng đang đăng nhập. Hỗ trợ lọc theo deckId, topicId, due, starred, phân trang.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'deckId',
          schema: { type: 'string' },
          description: 'Lọc theo deckId',
        },
        {
          in: 'query',
          name: 'topicId',
          schema: { type: 'string' },
          description: 'Lọc theo topicId',
        },
        {
          in: 'query',
          name: 'due',
          schema: { type: 'boolean' },
          description:
            'Chỉ lấy các thẻ đã đến hạn ôn tập (nextReviewAt <= now)',
        },
        {
          in: 'query',
          name: 'starred',
          schema: { type: 'boolean' },
          description:
            'Chỉ lấy các thẻ được đánh dấu sao (có cờ "starred" = true)',
        },
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', default: 1 },
          description: 'Trang hiện tại',
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 20 },
          description: 'Số lượng kết quả trên mỗi trang',
        },
      ],
      responses: {
        200: {
          description: 'Lấy danh sách user card states thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CardStatesResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/users/me/card-states/{cardId}': {
    get: {
      tags: ['User Card States'],
      summary: 'Lấy state của một user card',
      description:
        'Lấy thông tin state (SRS, cờ) của một card cụ thể của người dùng đang đăng nhập.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'cardId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của card',
        },
      ],
      responses: {
        200: {
          description: 'Lấy state của user card thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CardStateResponse' },
            },
          },
        },
        404: CardStateNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      tags: ['User Card States'],
      summary: 'Upsert state của một card',
      description:
        'Ghi đè toàn bộ state của một card. Nếu chưa có sẽ tự động tạo mới. Dùng khi học card lần đầu hoặc reset toàn bộ state',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'cardId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của card',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CardStatePayload' },
          },
        },
      },
      responses: {
        200: {
          description: 'Upsert card state thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/CardStateResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Upsert card state thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: CardStateBadRequest,
        404: CardStateNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    patch: {
      tags: ['User Card States'],
      summary: 'Cập nhật một phần state của một card',
      description:
        'Chỉ cập nhật những trường được gửi lên (như cập nhật srs hoặc cờ flags). Dùng khi chỉ update 1 trong 2 hoặc cả 2, không bắt buộc phải update cả 2',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'cardId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của card',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CardStatePatchPayload' },
          },
        },
      },
      responses: {
        200: {
          description: 'Cập nhật card state thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/CardStateResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Cập nhật card state thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: CardStatePatchBadRequest,
        404: CardStateNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};
