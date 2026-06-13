export default {
  CefrLevel: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '64a1234567890abcdef12345',
        description: 'ID tag.',
      },
      code: {
        type: 'string',
        example: 'a1',
        description: 'Mã ngắn (ví dụ: a1, a2).',
      },
      label: {
        type: 'string',
        example: 'A1',
        description: 'Tên hiển thị (ví dụ: A1, A2).',
      },
    },
  },
  CefrLevelsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Lấy danh sách CEFR levels thành công',
      },
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CefrLevel',
        },
      },
    },
  },
  CefrLevelPayload: {
    type: 'object',
    required: ['label'],
    properties: {
      label: {
        type: 'string',
        example: 'A1',
        description: 'Tên hiển thị (ví dụ: A1, A2).',
      },
    },
  },
  CefrLevelResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Lấy chi tiết CEFR level thành công',
      },
      data: {
        $ref: '#/components/schemas/CefrLevel',
      },
    },
  },
  Tag: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '64a1234567890abcdef12345',
        description: 'ID tag.',
      },
      code: {
        type: 'string',
        example: 'movie',
        description: 'Mã ngắn (ví dụ: movie, daily).',
      },
      label: {
        type: 'string',
        example: 'Movie',
        description: 'Tên hiển thị (ví dụ: Movie, Daily).',
      },
    },
  },
  TagsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Lấy danh sách tag thành công' },
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Tag',
        },
      },
    },
  },
  TagPayload: {
    type: 'object',
    required: ['label'],
    properties: {
      label: {
        type: 'string',
        example: 'Movie',
        description: 'Tên hiển thị (ví dụ: Movie, Daily).',
      },
    },
  },
  TagResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Lấy chi tiết tag thành công' },
      data: {
        $ref: '#/components/schemas/Tag',
      },
    },
  },
  Segment: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '64b1234567890abcdef12345',
        description: 'ID segment.',
      },
      lessonId: {
        type: 'string',
        example: '64a1234567890abcdef12345',
        description: 'Segment thuộc lesson nào.',
      },
      order: {
        type: 'integer',
        minimum: 1,
        example: 1,
        description: 'Thứ tự segment trong lesson (phải >= 1).',
      },
      startMs: {
        type: 'integer',
        minimum: 0,
        example: 1000,
        description: 'Thời điểm bắt đầu bằng mili giây (phải >= 0).',
      },
      endMs: {
        type: 'integer',
        minimum: 0,
        example: 5000,
        description: 'Thời điểm kết thúc bằng mili giây (phải > startMs).',
      },
      transcript: {
        type: 'object',
        properties: {
          original: {
            type: 'string',
            example: 'Hello world!',
            description: 'Câu gốc đầy đủ.',
          },
          normalized: {
            type: 'string',
            example: 'hello world',
            description: 'Chuẩn hóa để so sánh.',
          },
        },
      },
      translation: {
        type: 'string',
        example: 'Chào thế giới!',
        description: 'Bản dịch.',
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  SegmentsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Lấy danh sách segment thành công' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/Segment' },
      },
    },
  },
  SegmentPayload: {
    type: 'object',
    required: ['order', 'startMs', 'endMs', 'transcript', 'translation'],
    properties: {
      order: {
        type: 'integer',
        minimum: 1,
        example: 1,
        description: 'Thứ tự segment trong lesson (phải >= 1).',
      },
      startMs: {
        type: 'integer',
        minimum: 0,
        example: 1000,
        description: 'Thời điểm bắt đầu bằng mili giây (phải >= 0).',
      },
      endMs: {
        type: 'integer',
        minimum: 0,
        example: 5000,
        description: 'Thời điểm kết thúc bằng mili giây (phải > startMs).',
      },
      transcript: {
        type: 'object',
        required: ['original', 'normalized'],
        properties: {
          original: {
            type: 'string',
            example: 'Hello world!',
            description: 'Câu gốc đầy đủ.',
          },
          normalized: {
            type: 'string',
            example: 'hello world',
            description: 'Chuẩn hóa để so sánh.',
          },
        },
      },
      translation: {
        type: 'string',
        example: 'Chào thế giới!',
        description: 'Bản dịch.',
      },
    },
  },
  SegmentResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Lấy chi tiết segment thành công' },
      data: {
        $ref: '#/components/schemas/Segment',
      },
    },
  },
};
