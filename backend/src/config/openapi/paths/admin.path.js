const CefrNotFound = {
  description: 'Không tìm thấy CEFR level',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        code: 'CEFR_LEVEL_NOT_FOUND',
        message: 'CEFR level not found',
      },
    },
  },
};

const TagNotFound = {
  description: 'Không tìm thấy tag',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        code: 'TAG_NOT_FOUND',
        message: 'Tag not found',
      },
    },
  },
};

const LessonNotFound = {
  description: 'Không tìm thấy lesson',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        code: 'LESSON_NOT_FOUND',
        message: 'Lesson not found',
      },
    },
  },
};

const LessonSlugConflict = {
  description: 'Slug đã tồn tại',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        code: 'ALREADY_EXISTS',
        message: 'Resource already exists',
        errors: [
          {
            field: 'slug',
            message: 'Slug của lesson đã tồn tại trong hệ thống',
          },
        ],
      },
    },
  },
};

const LessonBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        MissingFields: {
          summary: 'Thiếu dữ liệu trường bắt buộc',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [
              { field: 'title', message: 'Trường title là bắt buộc' },
              { field: 'sourceUrl', message: 'Trường sourceUrl là bắt buộc' },
            ],
          },
        },
        InvalidStatus: {
          summary: 'Sai trạng thái',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [
              {
                field: 'status',
                message: 'Trường status phải là draft, published hoặc archived',
              },
            ],
          },
        },
      },
    },
  },
};

const LessonPublishBadRequest = {
  description: 'Không đủ điều kiện publish',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        AlreadyPublished: {
          summary: 'Bài học đã được publish',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Lesson is already published',
          },
        },
        MissingSegments: {
          summary: 'Chưa có nội dung',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Cannot publish a lesson with no segments',
          },
        },
      },
    },
  },
};

const LessonOrSegmentNotFound = {
  description: 'Không tìm thấy lesson hoặc segment',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        LessonNotFound: {
          summary: 'Lỗi sai lesson ID',
          value: {
            success: false,
            code: 'LESSON_NOT_FOUND',
            message: 'Lesson not found',
          },
        },
        SegmentNotFound: {
          summary: 'Lỗi sai segment ID',
          value: {
            success: false,
            code: 'SEGMENT_NOT_FOUND',
            message: 'Segment not found',
          },
        },
      },
    },
  },
};

const CefrBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        MissingFields: {
          summary: 'Thiếu dữ liệu trường bắt buộc',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [{ field: 'label', message: 'Trường label là bắt buộc' }],
          },
        },
      },
    },
  },
};

const TagBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        MissingFields: {
          summary: 'Thiếu dữ liệu trường bắt buộc',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [{ field: 'label', message: 'Trường label là bắt buộc' }],
          },
        },
      },
    },
  },
};

const SegmentBadRequest = {
  description: 'Invalid input data',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        MissingFields: {
          summary: 'Data missing or invalid data',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [
              {
                field: 'startMs',
                message:
                  'The startMs field is mandatory, must be a number and >= 0',
              },
              {
                field: 'endMs',
                message: 'The endMs field is mandatory and must be a number.',
              },
              {
                field: 'endMs',
                message: 'The endMs field must be > 0.',
              },
              {
                field: 'endMs',
                message:
                  'The endMs field must be larger than the startMs field.',
              },
              {
                field: 'transcript.original',
                message: 'The original field is required.',
              },
              {
                field: 'transcript.normalized',
                message: 'The normalized field is required.',
              },
              {
                field: 'translation',
                message: 'The translation field is required.',
              },
              {
                field: 'endMs',
                message:
                  'The endMs field must not exceed the audio length of the lesson.',
              },
              {
                field: 'startMs/endMs',
                message:
                  'The time allocated for this segment overlaps with that of other segments.',
              },
            ],
          },
        },
      },
    },
  },
};

const CefrConflict = {
  description: 'Dữ liệu CEFR Level đã tồn tại',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        DuplicateLabel: {
          summary: 'Trùng label',
          value: {
            success: false,
            code: 'ALREADY_EXISTS',
            message: 'Resource already exists',
            errors: [
              { field: 'label', message: 'Label CEFR level này đã tồn tại' },
            ],
          },
        },
      },
    },
  },
};

const TagConflict = {
  description: 'Dữ liệu Tag đã tồn tại',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        DuplicateLabel: {
          summary: 'Trùng label',
          value: {
            success: false,
            code: 'ALREADY_EXISTS',
            message: 'Resource already exists',
            errors: [{ field: 'label', message: 'Label tag này đã tồn tại' }],
          },
        },
      },
    },
  },
};

const DeckBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        MissingFields: {
          summary: 'Thiếu dữ liệu trường bắt buộc',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [{ field: 'title', message: 'Trường title là bắt buộc' }],
          },
        },
      },
    },
  },
};

const DeckNotFound = {
  description: 'Không tìm thấy deck',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        code: 'DECK_NOT_FOUND',
        message: 'Deck not found',
      },
    },
  },
};

const DeckSlugConflict = {
  description: 'Slug đã tồn tại',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        DuplicateSlug: {
          summary: 'Trùng slug',
          value: {
            success: false,
            code: 'ALREADY_EXISTS',
            message: 'Resource already exists',
            errors: [
              {
                field: 'slug',
                message:
                  'Slug của deck đã tồn tại trong hệ thống. Vui lòng thay đổi slug hoặc title',
              },
            ],
          },
        },
      },
    },
  },
};

const DeckOrTopicNotFound = {
  description: 'Không tìm thấy deck hoặc topic',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        code: 'DECK_OR_TOPIC_NOT_FOUND',
        message: 'Deck or topic not found',
      },
    },
  },
};

const TopicConflict = {
  description: 'Dữ liệu đã tồn tại',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        code: 'ALREADY_EXISTS',
        message: 'Resource already exists',
        errors: [
          {
            field: 'slug',
            message:
              'Slug của topic đã tồn tại. Vui lòng thay đổi slug hoặc title',
          },
        ],
      },
    },
  },
};

const TopicBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        summary: 'Thiếu dữ liệu trường bắt buộc',
        value: {
          success: false,
          code: 'INVALID_DATA',
          message: 'Invalid request data',
          errors: [{ field: 'name', message: 'Trường name là bắt buộc' }],
        },
      },
    },
  },
};

const TopicReorderBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        MissingFields: {
          summary: 'Thiếu hoặc sai cấu trúc dữ liệu',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [
              {
                field: 'topics',
                message: 'The topics field must be a non-empty array',
              },
              {
                field: 'topics[0].topicId',
                message: 'The topicId field is required',
              },
              {
                field: 'topics[0].order',
                message:
                  'The order field is required and must be an integer >= 1',
              },
            ],
          },
        },
        DuplicateOrderInArray: {
          summary: 'Trùng lặp order trong mảng',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [
              {
                field: 'topics',
                message: 'Order của các topics không được trùng lặp trong mảng',
              },
            ],
          },
        },
        InvalidTopicInDeck: {
          summary: 'Topic không thuộc Deck',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [
              {
                field: 'topics[0].topicId',
                message: 'Topic này không thuộc về deck hiện tại',
              },
            ],
          },
        },
      },
    },
  },
};

const TopicNotFound = {
  description: 'Không tìm thấy topic',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        code: 'TOPIC_NOT_FOUND',
        message: 'Topic not found',
      },
    },
  },
};

const DeckOrCardNotFound = {
  description: 'Không tìm thấy deck hoặc card',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        code: 'DECK_OR_CARD_NOT_FOUND',
        message: 'Deck or card not found',
      },
    },
  },
};

const CardBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        MissingFields: {
          summary: 'Thiếu dữ liệu trường bắt buộc',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [
              { field: 'topicId', message: 'Trường topicId là bắt buộc' },
              { field: 'term', message: 'Trường term là bắt buộc' },
              { field: 'pos', message: 'Trường pos là bắt buộc' },
              {
                field: 'translation',
                message: 'Trường translation là bắt buộc',
              },
            ],
          },
        },
        InvalidTopicInDeck: {
          summary: 'Topic không thuộc Deck',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [
              {
                field: 'topicId',
                message: 'Topic này không thuộc về deck hiện tại',
              },
            ],
          },
        },
      },
    },
  },
};

const CardReorderBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        MissingFields: {
          summary: 'Thiếu hoặc sai cấu trúc dữ liệu',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [
              {
                field: 'cards',
                message: 'The cards field must be a non-empty array',
              },
              {
                field: 'cards[0].cardId',
                message: 'The cardId field is required',
              },
              {
                field: 'cards[0].order',
                message:
                  'The order field is required and must be an integer >= 1',
              },
            ],
          },
        },
        DuplicateOrderInArray: {
          summary: 'Trùng lặp order trong mảng',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [
              {
                field: 'topics',
                message: 'Order của các topics không được trùng lặp trong mảng',
              },
            ],
          },
        },
        InvalidTopicInDeck: {
          summary: 'Topic không thuộc Deck',
          value: {
            success: false,
            code: 'INVALID_DATA',
            message: 'Invalid request data',
            errors: [
              {
                field: 'topics[0].topicId',
                message: 'Topic này không thuộc về deck hiện tại',
              },
            ],
          },
        },
      },
    },
  },
};

export default {
  '/admin/cefr-levels': {
    get: {
      tags: ['Admin cefr-levels'],
      summary: 'Lấy danh sách CEFR Levels',
      description:
        'Lấy toàn bộ danh sách các cấp độ CEFR (cefr_levels) dành cho Admin.',
      security: [
        {
          BearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: 'Lấy danh sách thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CefrLevelsResponse',
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
    post: {
      tags: ['Admin cefr-levels'],
      summary: 'Tạo CEFR Level mới',
      description: 'Tạo mới một CEFR level dành cho Admin.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CefrLevelPayload',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Tạo CEFR Level thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/CefrLevelResponse' }, // Kế thừa toàn bộ
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Tạo mới CEFR level thành công', // Chỉ đè duy nhất trường này
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: CefrBadRequest,
        409: CefrConflict,
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
  '/admin/cefr-levels/{id}': {
    get: {
      tags: ['Admin cefr-levels'],
      summary: 'Lấy chi tiết một CEFR Level',
      description: 'Lấy thông tin chi tiết một cấp độ CEFR dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của CEFR Level',
        },
      ],
      responses: {
        200: {
          description: 'Lấy thông tin thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CefrLevelResponse',
              },
            },
          },
        },
        404: CefrNotFound,
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
    put: {
      tags: ['Admin cefr-levels'],
      summary: 'Cập nhật CEFR Level',
      description: 'Cập nhật thông tin CEFR level dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của CEFR Level',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CefrLevelPayload',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Cập nhật CERF level thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/CefrLevelResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Cập nhật CEFR level thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: CefrBadRequest,
        409: CefrConflict,
        404: CefrNotFound,
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
    delete: {
      tags: ['Admin cefr-levels'],
      summary: 'Xóa CEFR Level',
      description: 'Xóa CEFR level dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của CEFR Level',
        },
      ],
      responses: {
        200: {
          description: 'Xóa CEFR Level thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse',
              },
            },
          },
        },
        404: CefrNotFound,
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
  '/admin/tags': {
    get: {
      tags: ['Admin tags'],
      summary: 'Lấy danh sách tag',
      description: 'Lấy toàn bộ danh sách tag dành cho Admin.',
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Lấy danh sách tag thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TagsResponse',
              },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      tags: ['Admin tags'],
      summary: 'Tạo tag mới',
      description: 'Tạo mới một tag dành cho Admin.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/TagPayload',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Tạo tag thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/TagResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Tạo tag thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: TagBadRequest,
        409: TagConflict,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/tags/{id}': {
    get: {
      tags: ['Admin tags'],
      summary: 'Lấy chi tiết một Tag',
      description: 'Lấy thông tin chi tiết một tag dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của Tag',
        },
      ],
      responses: {
        200: {
          description: 'Lấy thông tin tag thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TagResponse',
              },
            },
          },
        },
        404: TagNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      tags: ['Admin tags'],
      summary: 'Cập nhật Tag',
      description: 'Cập nhật thông tin tag dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của Tag',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/TagPayload',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Cập nhật tag thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/TagResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Cập nhật tag thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: TagBadRequest,
        409: TagConflict,
        404: TagNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      tags: ['Admin tags'],
      summary: 'Xóa tag',
      description: 'Xóa tag dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của Tag',
        },
      ],
      responses: {
        200: {
          description: 'Xóa tag thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse',
              },
            },
          },
        },
        404: TagNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/lessons': {
    get: {
      tags: ['Admin lessons'],
      summary: 'Lấy danh sách lessons',
      description:
        'Lấy danh sách tất cả lessons dành cho Admin. Hỗ trợ phân trang và tìm kiếm.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'status',
          schema: { type: 'string', enum: ['draft', 'published', 'archived'] },
          description: 'Lọc theo trạng thái',
        },
        {
          in: 'query',
          name: 'tagId',
          schema: { type: 'string' },
          description: 'Lọc theo tag',
        },
        {
          in: 'query',
          name: 'cefrLevelId',
          schema: { type: 'string' },
          description: 'Lọc theo CEFR level',
        },
        {
          in: 'query',
          name: 'mode',
          schema: { type: 'string', enum: ['dictation', 'shadowing'] },
          description: 'Lọc theo chế độ học',
        },
        {
          in: 'query',
          name: 'q',
          schema: { type: 'string' },
          description: 'Tìm kiếm theo từ khóa (tiêu đề, mô tả)',
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
          schema: { type: 'integer', default: 10 },
          description: 'Số lượng bài học trên mỗi trang',
        },
      ],
      responses: {
        200: {
          description: 'Lấy danh sách lessons thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LessonsResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      tags: ['Admin lessons'],
      summary: 'Tạo lesson mới',
      description: 'Tạo mới một lesson. Mặc định trạng thái là draft.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LessonPayload' },
          },
        },
      },
      responses: {
        201: {
          description: 'Tạo lesson thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/LessonResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Tạo lesson thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: LessonBadRequest,
        409: LessonSlugConflict,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/lessons/{lessonId}': {
    get: {
      tags: ['Admin lessons'],
      summary: 'Lấy chi tiết một lesson',
      description: 'Lấy thông tin chi tiết một lesson bất kể trạng thái.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
      ],
      responses: {
        200: {
          description: 'Lấy chi tiết lesson thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LessonResponse' },
            },
          },
        },
        404: LessonNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      tags: ['Admin lessons'],
      summary: 'Cập nhật lesson',
      description: 'Cập nhật thông tin của lesson.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LessonPayload' },
          },
        },
      },
      responses: {
        200: {
          description: 'Cập nhật lesson thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/LessonResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Cập nhật bài học thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: LessonBadRequest,
        404: LessonNotFound,
        409: LessonSlugConflict,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      tags: ['Admin lessons'],
      summary: 'Xóa hoặc archive lesson',
      description: 'Xóa mềm hoặc chuyển trạng thái lesson sang archived.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
      ],
      responses: {
        200: {
          description: 'Xóa lesson thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        404: LessonNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/lessons/{lessonId}/publish': {
    post: {
      tags: ['Admin lessons'],
      summary: 'Publish lesson',
      description:
        'Chuyển trạng thái lesson từ draft sang published và ghi nhận publishedAt.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
      ],
      responses: {
        200: {
          description: 'Publish lesson thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/LessonResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Publish lesson thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: LessonPublishBadRequest,
        404: LessonNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/lessons/{lessonId}/segments': {
    get: {
      tags: ['Admin lesson segments'],
      summary: 'Lấy danh sách segment của lesson',
      description:
        'Lấy danh sách các segment thuộc về một lesson cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
      ],
      responses: {
        200: {
          description: 'Lấy danh sách segments thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SegmentsResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      tags: ['Admin lesson segments'],
      summary: 'Tạo segment mới',
      description: 'Tạo mới một segment cho một lesson cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SegmentPayload' },
          },
        },
      },
      responses: {
        201: {
          description: 'Tạo segment thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SegmentResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Tạo segment thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: SegmentBadRequest,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/lessons/{lessonId}/segments/{segmentId}': {
    get: {
      tags: ['Admin lesson segments'],
      summary: 'Lấy chi tiết một segment',
      description:
        'Lấy thông tin chi tiết của một segment cụ thể trong một lesson cụ thể dành cho Admin.',
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
          description: 'Lấy thông tin segment thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SegmentResponse' },
            },
          },
        },
        404: LessonOrSegmentNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      tags: ['Admin lesson segments'],
      summary: 'Cập nhật segment',
      description:
        'Cập nhật thông tin segment cụ thể trong một lesson cụ thể dành cho Admin.',
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
            schema: { $ref: '#/components/schemas/SegmentPayload' },
          },
        },
      },
      responses: {
        200: {
          description: 'Segment updated successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SegmentResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Segment updated successfully',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: SegmentBadRequest,
        404: LessonOrSegmentNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      tags: ['Admin lesson segments'],
      summary: 'Delete lesson segment',
      description: 'Delete lesson segment for Admin.',
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
          description: 'Segment deleted successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'SEGMENT_DELETED_SUCCESS',
                      },
                      message: {
                        type: 'string',
                        example: 'Segment deleted successfully',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        404: LessonOrSegmentNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/decks': {
    get: {
      tags: ['Admin decks'],
      summary: 'Lấy danh sách decks',
      description:
        'Lấy danh sách tất cả bộ thẻ (decks) dành cho Admin. Hỗ trợ phân trang và tìm kiếm.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'tagId',
          schema: { type: 'string' },
          description: 'Lọc theo tag',
        },
        {
          in: 'query',
          name: 'cefrLevelId',
          schema: { type: 'string' },
          description: 'Lọc theo CEFR level',
        },
        {
          in: 'query',
          name: 'q',
          schema: { type: 'string' },
          description: 'Tìm kiếm theo từ khóa (tiêu đề, mô tả)',
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
          schema: { type: 'integer', default: 10 },
          description: 'Số lượng bộ thẻ trên mỗi trang',
        },
      ],
      responses: {
        200: {
          description: 'Lấy danh sách decks thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeckListResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      tags: ['Admin decks'],
      summary: 'Tạo deck mới',
      description: 'Tạo mới deck. Mặc định trạng thái là draft.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/DeckPayload' },
          },
        },
      },
      responses: {
        201: {
          description: 'Tạo deck thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/DeckDetailResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Tạo deck thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: DeckBadRequest,
        409: DeckSlugConflict,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/decks/{deckId}': {
    get: {
      tags: ['Admin decks'],
      summary: 'Lấy chi tiết một deck',
      description: 'Lấy thông tin chi tiết một deck bất kể trạng thái.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
      ],
      responses: {
        200: {
          description: 'Lấy chi tiết deck thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeckDetailResponse' },
            },
          },
        },
        404: DeckNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      tags: ['Admin decks'],
      summary: 'Cập nhật deck',
      description: 'Cập nhật thông tin của một deck.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/DeckPayload' },
          },
        },
      },
      responses: {
        200: {
          description: 'Cập nhật deck thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/DeckDetailResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Cập nhật deck thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: DeckBadRequest,
        404: DeckNotFound,
        409: DeckSlugConflict,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      tags: ['Admin decks'],
      summary: 'Xóa mềm deck',
      description: 'Chuyển trạng thái deck sang archived thay vì xóa cứng.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
      ],
      responses: {
        200: {
          description: 'Xóa deck thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        404: DeckNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/decks/{deckId}/topics': {
    get: {
      tags: ['Admin topics'],
      summary: 'Lấy danh sách topic của deck',
      description:
        'Lấy danh sách các topic thuộc về một deck cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
      ],
      responses: {
        200: {
          description: 'Lấy danh sách topic thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TopicsResponse' },
            },
          },
        },
        404: DeckNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      tags: ['Admin topics'],
      summary: 'Tạo topic mới',
      description: 'Tạo mới một topic cho một deck cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/TopicPayload' },
          },
        },
      },
      responses: {
        201: {
          description: 'Tạo topic thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/TopicResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Tạo topic thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: TopicBadRequest,
        409: TopicConflict,
        404: DeckNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/decks/{deckId}/topics/reorder': {
    patch: {
      tags: ['Admin topics'],
      summary: 'Sắp xếp lại các topic',
      description: 'Cập nhật lại order của nhiều topics cùng lúc trong deck.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/TopicReorderPayload' },
          },
        },
      },
      responses: {
        200: {
          description: 'Sắp xếp topics thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'TOPIC_REORDERED_SUCCESS',
                      },
                      message: {
                        type: 'string',
                        example: 'Topics reordered successfully',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        404: DeckNotFound,
        400: TopicReorderBadRequest,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/decks/{deckId}/topics/{topicId}': {
    get: {
      tags: ['Admin topics'],
      summary: 'Lấy chi tiết một topic',
      description:
        'Lấy thông tin chi tiết của một topic cụ thể trong một deck cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
        {
          in: 'path',
          name: 'topicId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của topic',
        },
      ],
      responses: {
        200: {
          description: 'Lấy chi tiết topic thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TopicResponse' },
            },
          },
        },
        404: DeckOrTopicNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      tags: ['Admin topics'],
      summary: 'Cập nhật topic',
      description:
        'Cập nhật thông tin topic trong một deck cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
        {
          in: 'path',
          name: 'topicId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của topic',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/TopicPayload' },
          },
        },
      },
      responses: {
        200: {
          description: 'Cập nhật topic thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/TopicResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Cập nhật topic thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: TopicBadRequest,
        404: DeckOrTopicNotFound,
        409: TopicConflict,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      tags: ['Admin topics'],
      summary: 'Xóa topic khỏi deck',
      description: 'Xóa topic khỏi deck dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
        {
          in: 'path',
          name: 'topicId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của topic',
        },
      ],
      responses: {
        200: {
          description: 'Xóa topic thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        404: DeckOrTopicNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/decks/{deckId}/cards': {
    get: {
      tags: ['Admin cards'],
      summary: 'Lấy danh sách card của deck',
      description:
        'Lấy danh sách các card thuộc về một deck cụ thể dành cho Admin. Hỗ trợ lọc theo topicId, q, page, limit.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
        {
          in: 'query',
          name: 'topicId',
          schema: { type: 'string' },
          description: 'Lọc theo topic',
        },
        {
          in: 'query',
          name: 'q',
          schema: { type: 'string' },
          description: 'Tìm kiếm theo từ khóa (term, translation)',
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
          schema: { type: 'integer', default: 10 },
          description: 'Số lượng card trên mỗi trang',
        },
        {
          in: 'query',
          name: 'pos',
          schema: { type: 'string' },
          description: 'Loại từ (verb, noun, ...)',
        },
      ],
      responses: {
        200: {
          description: 'Lấy danh sách cards thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CardsResponse' },
            },
          },
        },
        404: DeckNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      tags: ['Admin cards'],
      summary: 'Tạo card mới',
      description:
        'Tạo mới một card cho một deck và topic cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CardPayload' },
          },
        },
      },
      responses: {
        201: {
          description: 'Tạo card thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/CardResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Tạo card thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: CardBadRequest,
        404: DeckNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/decks/{deckId}/cards/{cardId}': {
    get: {
      tags: ['Admin cards'],
      summary: 'Lấy chi tiết một card',
      description: 'Lấy thông tin chi tiết của một card cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
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
          description: 'Lấy chi tiết card thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CardResponse' },
            },
          },
        },
        404: DeckOrCardNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      tags: ['Admin cards'],
      summary: 'Cập nhật card',
      description:
        'Cập nhật thông tin card (term, translation, pos, explanation, ...).',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
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
            schema: { $ref: '#/components/schemas/CardPayload' },
          },
        },
      },
      responses: {
        200: {
          description: 'Cập nhật card thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/CardResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Cập nhật card thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: CardBadRequest,
        404: DeckOrCardNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      tags: ['Admin cards'],
      summary: 'Xóa card',
      description: 'Xóa card khỏi deck dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deckId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của deck',
        },
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
          description: 'Xóa card thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        404: DeckOrCardNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/topics/{topicId}/cards/reorder': {
    patch: {
      tags: ['Admin cards'],
      summary: 'Sắp xếp lại các cards',
      description: 'Cập nhật lại order của nhiều cards cùng lúc trong topic.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'topicId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của topic',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CardReorderPayload' },
          },
        },
      },
      responses: {
        200: {
          description: 'Sắp xếp cards thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'CARD_REORDERED_SUCCESS',
                      },
                      message: {
                        type: 'string',
                        example: 'Cards reordered successfully',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        404: TopicNotFound,
        400: CardReorderBadRequest,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};
