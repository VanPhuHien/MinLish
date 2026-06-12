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
    required: ['code', 'label'],
    properties: {
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
};
