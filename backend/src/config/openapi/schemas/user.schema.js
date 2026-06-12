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
      status: {
        type: 'string',
        enum: ['in_progress', 'completed'],
        example: 'in_progress',
        description: 'Trạng thái bài học (in_progress, completed).',
      },
      progressPct: {
        type: 'number',
        example: 45.5,
        description: 'Phần trăm hoàn thành lesson.',
      },
      lastSegmentOrder: {
        type: 'integer',
        example: 5,
        description: 'Lần gần nhất user đang ở segment số mấy.',
      },
      selectedMode: {
        type: 'string',
        enum: ['dictation', 'shadowing'],
        example: 'dictation',
        description: 'Mode đang học gần nhất như dictation hay shadowing.',
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
      message: { type: 'string', example: 'Lấy tiến độ bài học thành công' },
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
          completed: {
            type: 'boolean',
            example: true,
            description: 'Đã vượt qua hay chưa.',
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
          completed: {
            type: 'boolean',
            example: false,
            description: 'Đã vượt qua hay chưa.',
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
        example: 'Lấy tiến độ các segment thành công',
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
          lastGrade: { type: 'integer', example: 4 },
          nextReviewAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-10-18T09:00:00.000Z',
          },
        },
        description: 'Trạng thái Spaced Repetition.',
      },
      flags: {
        type: 'array',
        items: { type: 'string' },
        example: ['starred'],
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
        example: 'Lấy trạng thái học từ vựng thành công',
      },
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/UserCardState',
        },
      },
    },
  },
};
