const phoneticInput = {
  type: 'object',
  properties: {
    text: { type: 'string', example: '/ˈfæməli/' },
    audio: {
      type: 'string',
      example: 'https://example.com/audio/family-us.mp3',
    },
    locale: { type: 'string', example: 'en-US' },
  },
};

const localizedText = {
  type: 'object',
  properties: {
    vi: {
      type: 'string',
      example: 'Những người có quan hệ huyết thống hoặc sống chung.',
    },
    en: { type: 'string', example: 'A group of related people.' },
  },
};

export default {
  UserOwnedDeck: {
    allOf: [
      { $ref: '#/components/schemas/Deck' },
      {
        type: 'object',
        properties: {
          ownerType: {
            type: 'string',
            enum: ['user'],
            example: 'user',
          },
          ownerId: {
            type: 'string',
            example: '665f1f77bcf86cd799439020',
          },
          status: {
            type: 'string',
            enum: ['published'],
            example: 'published',
          },
        },
      },
    ],
  },

  // ---------- Deck ----------
  UserDeckCreateRequest: {
    type: 'object',
    required: ['title'],
    description:
      'Tạo bộ thẻ cá nhân. Chỉ cần tên; deck luôn ở trạng thái published và thuộc sở hữu người dùng hiện tại.',
    properties: {
      title: {
        type: 'string',
        maxLength: 100,
        example: 'Bộ thẻ của tôi',
      },
      description: {
        type: 'string',
        maxLength: 500,
        example: 'Từ vựng cá nhân cần ôn.',
      },
    },
  },
  UserDeckUpdateRequest: {
    type: 'object',
    description:
      'Các trường đều tùy chọn nhưng phải gửi ít nhất một (title hoặc description).',
    properties: {
      title: {
        type: 'string',
        maxLength: 100,
        example: 'Bộ thẻ của tôi (đã sửa)',
      },
      description: {
        type: 'string',
        maxLength: 500,
        example: 'Mô tả mới.',
      },
    },
  },
  UserDeckListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: {
        type: 'string',
        example: 'Lấy danh sách deck của bạn thành công.',
      },
      data: {
        type: 'object',
        properties: {
          decks: {
            type: 'array',
            description:
              'Chỉ gồm các deck có ownerType = user và ownerId là người dùng hiện tại.',
            items: { $ref: '#/components/schemas/UserOwnedDeck' },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              totalItems: { type: 'integer', example: 3 },
              totalPages: { type: 'integer', example: 1 },
            },
          },
        },
      },
    },
  },
  UserDeckDetailResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Lấy chi tiết deck thành công.' },
      data: { $ref: '#/components/schemas/UserOwnedDeck' },
    },
  },
  UserDeckCreateResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Tạo deck thành công.' },
      data: { $ref: '#/components/schemas/UserOwnedDeck' },
    },
  },
  UserDeckUpdateResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Cập nhật deck thành công.' },
      data: { $ref: '#/components/schemas/UserOwnedDeck' },
    },
  },

  // ---------- Topic ----------
  UserTopicCreateRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', example: 'Family' },
      order: { type: 'integer', example: 1 },
    },
  },
  UserTopicUpdateRequest: {
    type: 'object',
    description: 'Tất cả các trường đều tùy chọn; chỉ gửi trường cần cập nhật.',
    properties: {
      name: { type: 'string', example: 'Family (updated)' },
      order: { type: 'integer', example: 2 },
    },
  },
  UserTopicListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Lấy danh sách topic thành công.' },
      data: {
        type: 'object',
        properties: {
          deck: { $ref: '#/components/schemas/UserOwnedDeck' },
          topics: {
            type: 'array',
            items: { $ref: '#/components/schemas/Topic' },
          },
        },
      },
    },
  },
  UserTopicMutationResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Thao tác thành công.' },
      data: { $ref: '#/components/schemas/Topic' },
    },
  },

  // ---------- Card ----------
  UserCardCreateRequest: {
    type: 'object',
    required: ['topicId', 'term'],
    properties: {
      topicId: {
        type: 'string',
        pattern: '^[a-fA-F0-9]{24}$',
        example: '665f1f77bcf86cd799439041',
      },
      order: { type: 'integer', example: 1 },
      term: { type: 'string', example: 'family' },
      pos: { type: 'string', example: 'noun' },
      phonetics: { type: 'array', items: phoneticInput },
      translation: { type: 'string', example: 'gia đình' },
      explanation: localizedText,
      examples: {
        type: 'object',
        properties: {
          vi: { type: 'string', example: 'Gia đình tôi có bốn người.' },
          en: { type: 'string', example: 'My family has four people.' },
        },
      },
      imageUrl: {
        type: 'string',
        example: 'https://example.com/images/family.jpg',
      },
    },
  },
  UserCardUpdateRequest: {
    type: 'object',
    description: 'Tất cả các trường đều tùy chọn; chỉ gửi trường cần cập nhật.',
    properties: {
      topicId: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
      order: { type: 'integer', example: 2 },
      term: { type: 'string', example: 'family' },
      pos: { type: 'string', example: 'noun' },
      phonetics: { type: 'array', items: phoneticInput },
      translation: { type: 'string', example: 'gia đình' },
      explanation: localizedText,
      examples: {
        type: 'object',
        properties: {
          vi: { type: 'string' },
          en: { type: 'string' },
        },
      },
      imageUrl: { type: 'string' },
    },
  },
  UserCardListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Lấy danh sách card thành công.' },
      data: {
        type: 'object',
        properties: {
          cards: {
            type: 'array',
            items: { $ref: '#/components/schemas/Card' },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              totalItems: { type: 'integer', example: 49 },
              totalPages: { type: 'integer', example: 3 },
            },
          },
        },
      },
    },
  },
  UserCardMutationResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Thao tác thành công.' },
      data: { $ref: '#/components/schemas/Card' },
    },
  },
};
