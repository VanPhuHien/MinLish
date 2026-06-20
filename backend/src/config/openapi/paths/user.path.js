const LessonNotFound = {
  description: 'Không tìm thấy lesson',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        message: 'Không tìm thấy lesson',
      },
    },
  },
};

const SegmentNotFound = {
  description: 'Không tìm thấy segment',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        message: 'Không tìm thấy segment',
      },
    },
  },
};

const LessonOrSegmentNotFound = {
  description: 'Không tìm thấy tài nguyên (Lesson hoặc Segment)',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        LessonError: {
          summary: 'Lỗi không tìm thấy Lesson',
          value: LessonNotFound.content['application/json'].example,
        },
        SegmentError: {
          summary: 'Lỗi không tìm thấy Segment',
          value: SegmentNotFound.content['application/json'].example,
        },
      },
    },
  },
};

const ProgressBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        InvalidStatus: {
          summary: 'Trạng thái không hợp lệ',
          value: {
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: [
              {
                field: 'status',
                message: 'Trạng thái phải là in_progress hoặc completed',
              },
            ],
          },
        },
        InvalidMode: {
          summary: 'Chế độ không hợp lệ',
          value: {
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: [
              {
                field: 'selectedMode',
                message: 'Chế độ học phải là dictation hoặc shadowing',
              },
            ],
          },
        },
      },
    },
  },
};

const CardStateNotFound = {
  description: 'Không tìm thấy user card state',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        code: 'CARD_STATE_NOT_FOUND',
        message: 'User card state not found',
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
  description: 'Dữ liệu đầu vào không hợp lệ hoặc thiếu dữ liệu khi tạo mới',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        MissingFields: {
          summary: 'Thiếu deckId và topicId khi tạo mới',
          value: {
            success: false,
            code: 'CARD_STATE_CREATE_MISSING_DATA',
            message:
              'deckId and topicId are required when creating a new card state',
            errors: [],
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

export default {
  '/users/me/lessons/{lessonId}/segments-progress': {
    get: {
      tags: ['User Segment Progress'],
      summary: 'Lấy danh sách segment progress của một lesson',
      description:
        'Lấy danh sách segment progress của một lesson của người dùng hiện tại.',
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
          description: 'Lấy danh sách segment progress của lesson thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SegmentProgressResponse',
              },
            },
          },
        },
        404: LessonNotFound,
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        500: {
          $ref: '#/components/responses/ServerError',
        },
      },
    },
  },
  '/users/me/lessons/{lessonId}/segments/{segmentId}/progress': {
    get: {
      tags: ['User Segment Progress'],
      summary: 'Lấy chi tiết segment progress trong một lesson',
      description:
        'Lấy thông tin segment progress (dictation, shadowing) của trong một lesson cụ thể.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
        {
          in: 'path',
          name: 'segmentId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của segment',
        },
      ],
      responses: {
        200: {
          description: 'Lấy chi tiết segment progress trong lesson thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SegmentProgressSingleResponse',
              },
            },
          },
        },
        404: LessonOrSegmentNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },

    patch: {
      tags: ['User Segment Progress'],
      summary: 'Upsert/Cập nhật một phần segment progress',
      description:
        'Upsert hoặc cập nhật một phần block dictation hoặc shadowing của segment progress trong một lesson. Nếu chưa có tiến độ sẽ tự động tạo mới.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
        {
          in: 'path',
          name: 'segmentId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của segment',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SegmentProgressPayload',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Cập nhật một phần segment progress thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  {
                    $ref: '#/components/schemas/SegmentProgressSingleResponse',
                  },
                  {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'SEGMENT_PROGRESS_UPDATE_SUCCESS',
                      },
                      message: {
                        type: 'string',
                        example: 'Successfully updated segment progress',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: ProgressBadRequest,
        404: LessonOrSegmentNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' },
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
          name: 'hidden',
          schema: { type: 'boolean' },
          description:
            'Lọc theo trạng thái bị ẩn của thẻ (có cờ "hidden" = true/false)',
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
    patch: {
      tags: ['User Card States'],
      summary: 'Upsert / Cập nhật state của một card',
      description:
        'Cập nhật một phần state của một card. Nếu card chưa có state, sẽ tự động tạo mới (bắt buộc phải có deckId và topicId trong body khi tạo mới).',
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
                      code: {
                        type: 'string',
                        example: 'CARD_STATE_UPSERT_SUCCESS',
                      },
                      message: {
                        type: 'string',
                        example: 'Successfully created/updated card state',
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
