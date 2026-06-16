export default {
  VocabularySearchItem: {
    type: 'object',
    properties: {
      sourceCardId: {
        type: 'string',
        description: 'ObjectId của card hệ thống nguồn.',
        example: '665f1f77bcf86cd799439051',
      },
      term: { type: 'string', example: 'family' },
      translation: { type: 'string', example: 'gia đình' },
      pos: { type: 'string', example: 'noun' },
      definition: {
        type: 'string',
        description: 'Lấy từ explanation.vi của card nguồn.',
        example: 'Những người có quan hệ huyết thống.',
      },
      example: {
        type: 'string',
        description: 'Lấy từ examples.en của card nguồn.',
        example: 'My family has four people.',
      },
    },
  },
  VocabularySearchResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Tìm kiếm từ vựng thành công.' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/VocabularySearchItem' },
      },
    },
  },
};
