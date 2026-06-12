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
};
