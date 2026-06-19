export default {
  UserLessonProgress: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '64b1234567890abcdef12345',
        description: 'ID bản ghi tiến độ học lesson.',
      },
      userId: {
        type: 'string',
        example: '64a000111222333444555666',
        description: 'User nào.',
      },
      lessonId: {
        type: 'string',
        example: '64c999888777666555444333',
        description: 'Lesson nào.',
      },
      dictation: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['in_progress', 'completed'],
            example: 'in_progress',
            description: 'Trạng thái (in_progress, completed).',
          },
          progressPct: {
            type: 'number',
            example: 0,
            description: 'Phần trăm hoàn thành.',
          },
          lastSegmentOrder: {
            type: 'integer',
            example: 0,
            description: 'Lần gần nhất user đang ở segment số mấy.',
          },
        },
        description: 'Tiến độ học dictation.',
      },
      shadowing: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['in_progress', 'completed'],
            example: 'in_progress',
            description: 'Trạng thái (in_progress, completed).',
          },
          progressPct: {
            type: 'number',
            example: 0,
            description: 'Phần trăm hoàn thành.',
          },
          lastSegmentOrder: {
            type: 'integer',
            example: 0,
            description: 'Lần gần nhất user đang ở segment số mấy.',
          },
        },
        description: 'Tiến độ học shadowing.',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2023-10-15T08:30:00.000Z',
        description: 'Lần cập nhật gần nhất.',
      },
    },
  },
  LessonProgressResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Lấy danh sách lesson progress thành công',
      },
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/UserLessonProgress',
          //#: Dòng đầu tiên cao nhất của file openapi/index.js
        },
      },
    },
  },
  UserSegmentProgress: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '64d111222333444555666777',
        description: 'ID bản ghi.',
      },
      userId: {
        type: 'string',
        example: '64a000111222333444555666',
        description: 'User nào.',
      },
      lessonId: {
        type: 'string',
        example: '64c999888777666555444333',
        description: 'Thuộc lesson nào.',
      },
      segmentId: {
        type: 'string',
        example: '64e888777666555444333222',
        description: 'Thuộc segment nào.',
      },
      dictation: {
        type: 'object',
        properties: {
          attemptCount: {
            type: 'integer',
            example: 3,
            description: 'Số lần thử.',
          },
          bestScore: {
            type: 'number',
            example: 95.5,
            description: 'Điểm tốt nhất.',
          },
          hintUsedCount: {
            type: 'integer',
            example: 1,
            description: 'Đã dùng gợi ý bao nhiêu lần.',
          },
        },
        description: 'Trạng thái Dictation cho segment này.',
      },
      shadowing: {
        type: 'object',
        properties: {
          attemptCount: {
            type: 'integer',
            example: 2,
            description: 'Số lần thử.',
          },
          bestScore: {
            type: 'number',
            example: 88.0,
            description: 'Điểm tốt nhất.',
          },
          latestAudioUrl: {
            type: 'string',
            example: 'https://cdn.minlish.com/audio/user_shadowing.mp3',
            description: 'URL audio mới nhất.',
          },
        },
        description: 'Trạng thái Shadowing cho segment này.',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2023-10-15T09:00:00.000Z',
        description: 'Lần cập nhật gần nhất.',
      },
    },
  },
  SegmentProgressResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Lấy danh sách segment progress của lesson thành công',
      },
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/UserSegmentProgress',
        },
      },
    },
  },
  UserCardState: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '64f111222333444555666777',
        description: 'ID state.',
      },
      userId: {
        type: 'string',
        example: '64a000111222333444555666',
        description: 'User nào.',
      },
      cardId: {
        type: 'string',
        example: '64b222333444555666777888',
        description: 'Card nào.',
      },
      deckId: {
        type: 'string',
        example: '64c333444555666777888999',
        description: 'Thuộc deck nào.',
      },
      topicId: {
        type: 'string',
        example: '64d444555666777888999000',
        description: 'Thuộc topic nào.',
      },
      srs: {
        type: 'object',
        properties: {
          easeFactor: { type: 'number', example: 2.5 },
          interval: { type: 'integer', example: 6 },
          lastGrade: { type: 'integer', example: 3 },
          nextReviewAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-10-18T09:00:00.000Z',
          },
        },
        description: 'Trạng thái Spaced Repetition.',
      },
      flags: {
        type: 'object',
        properties: {
          starred: { type: 'boolean', example: false },
          hidden: { type: 'boolean', example: false },
        },
        description: 'Cờ đặc biệt như đánh dấu sao, tạm ẩn.',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2023-10-01T08:00:00.000Z',
        description: 'Ngày bắt đầu học card này.',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2023-10-15T09:00:00.000Z',
        description: 'Ngày cập nhật gần nhất.',
      },
    },
  },
  CardStatesResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Lấy danh sách user card states thành công',
      },
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/UserCardState',
        },
      },
      pagination: {
        type: 'object',
        properties: {
          totalItems: { type: 'integer', example: 100 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 10 },
        },
      },
    },
  },
  CardStateResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Lấy chi tiết user card state thành công',
      },
      data: {
        $ref: '#/components/schemas/UserCardState',
      },
    },
  },
  CardStatePayload: {
    type: 'object',
    required: ['deckId', 'topicId'],
    properties: {
      deckId: { type: 'string', example: '64c333444555666777888999' },
      topicId: { type: 'string', example: '64d444555666777888999000' },
      srs: {
        type: 'object',
        properties: {
          lastGrade: {
            type: 'integer',
            minimum: 0,
            maximum: 3,
            example: 3,
            description:
              'Điểm đánh giá (0-3: 0=Again, 1=Hard, 2=Good, 3=Easy). Backend sẽ dùng để tính toán easeFactor, interval, nextReviewAt.',
          },
        },
      },
      flags: {
        type: 'object',
        properties: {
          starred: { type: 'boolean', example: false },
          hidden: { type: 'boolean', example: false },
        },
      },
    },
  },
  CardStatePatchPayload: {
    type: 'object',
    properties: {
      srs: {
        type: 'object',
        properties: {
          lastGrade: {
            type: 'integer',
            minimum: 0,
            maximum: 3,
            example: 3,
            description:
              'Điểm đánh giá mới (0-3: 0=Again, 1=Hard, 2=Good, 3=Easy). Backend sẽ dùng để tính toán easeFactor, interval, nextReviewAt mới.',
          },
        },
      },
      flags: {
        type: 'object',
        properties: {
          starred: { type: 'boolean', example: false },
          hidden: { type: 'boolean', example: false },
        },
      },
    },
  },
  LessonProgressPayload: {
    type: 'object',
    properties: {
      dictation: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['in_progress', 'completed'],
            example: 'in_progress',
          },
          progressPct: { type: 'number', example: 0 },
          lastSegmentOrder: { type: 'integer', example: 0 },
        },
      },
      shadowing: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['in_progress', 'completed'],
            example: 'in_progress',
          },
          progressPct: { type: 'number', example: 0 },
          lastSegmentOrder: { type: 'integer', example: 0 },
        },
      },
    },
  },
  LessonProgressSingleResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Lấy chi tiết lesson progress thành công',
      },
      data: { $ref: '#/components/schemas/UserLessonProgress' },
    },
  },
  SegmentProgressPayload: {
    type: 'object',
    description:
      'PUT: ghi đè toàn bộ. PATCH: chỉ truyền block (dictation / shadowing) muốn update.',
    properties: {
      dictation: {
        type: 'object',
        properties: {
          attemptCount: { type: 'integer', example: 3 },
          hintUsedCount: { type: 'integer', example: 1 },
        },
      },
      shadowing: {
        type: 'object',
        properties: {
          attemptCount: { type: 'integer', example: 2 },
          latestAudioUrl: {
            type: 'string',
            example: 'https://cdn.minlish.com/audio/user_shadowing.mp3',
          },
        },
      },
    },
  },
  SegmentProgressSingleResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Lấy chi tiết segment progress thành công',
      },
      data: { $ref: '#/components/schemas/UserSegmentProgress' },
    },
  },
};
