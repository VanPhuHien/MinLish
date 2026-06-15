import { bearerAuth } from '../helpers/security.js';

const deckIdParam = {
  name: 'deckId',
  in: 'path',
  required: true,
  description: 'ObjectId của deck thuộc sở hữu người dùng.',
  schema: {
    type: 'string',
    pattern: '^[a-fA-F0-9]{24}$',
    example: '665f1f77bcf86cd799439031',
  },
};

const topicIdParam = {
  name: 'topicId',
  in: 'path',
  required: true,
  description: 'ObjectId của topic.',
  schema: {
    type: 'string',
    pattern: '^[a-fA-F0-9]{24}$',
    example: '665f1f77bcf86cd799439041',
  },
};

const cardIdParam = {
  name: 'cardId',
  in: 'path',
  required: true,
  description: 'ObjectId của card.',
  schema: {
    type: 'string',
    pattern: '^[a-fA-F0-9]{24}$',
    example: '665f1f77bcf86cd799439051',
  },
};

const pageParam = {
  name: 'page',
  in: 'query',
  required: false,
  description: 'Số trang cần lấy.',
  schema: { type: 'integer', minimum: 1, default: 1, example: 1 },
};

const limitParam = {
  name: 'limit',
  in: 'query',
  required: false,
  description: 'Số lượng item trên mỗi trang.',
  schema: {
    type: 'integer',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  },
};

const qParam = {
  name: 'q',
  in: 'query',
  required: false,
  description: 'Từ khóa tìm kiếm.',
  schema: { type: 'string', example: 'family' },
};

const NotFound = (message) => ({
  description: message,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: { success: false, message },
    },
  },
});

const jsonBody = (ref) => ({
  required: true,
  content: {
    'application/json': {
      schema: { $ref: `#/components/schemas/${ref}` },
    },
  },
});

const jsonResponse = (ref, description) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: `#/components/schemas/${ref}` },
    },
  },
});

const TAG = 'User Deck';

export default {
  // ==================== DECK ====================
  '/users/me/decks': {
    get: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Lấy danh sách deck của người dùng hiện tại',
      description:
        'Trả về danh sách deck do người dùng hiện tại sở hữu (ownerType = user). Yêu cầu đăng nhập bằng Bearer token.',
      parameters: [qParam, pageParam, limitParam],
      responses: {
        200: jsonResponse(
          'UserDeckListResponse',
          'Lấy danh sách deck thành công.'
        ),
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Tạo deck mới',
      description:
        'Tạo một deck thuộc sở hữu người dùng hiện tại (ownerType = user, ownerId = người dùng hiện tại). Status luôn là published vì deck chỉ dùng cho cá nhân. Mỗi người dùng được tạo tối đa 3 bộ thẻ; vượt quá sẽ trả về lỗi 400.',
      requestBody: jsonBody('UserDeckCreateRequest'),
      responses: {
        201: jsonResponse('UserDeckCreateResponse', 'Tạo deck thành công.'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/users/me/decks/{deckId}': {
    get: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Lấy chi tiết deck của người dùng',
      description: 'Trả về chi tiết một deck do người dùng hiện tại sở hữu.',
      parameters: [deckIdParam],
      responses: {
        200: jsonResponse(
          'UserDeckDetailResponse',
          'Lấy chi tiết deck thành công.'
        ),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: NotFound('Không tìm thấy deck'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Cập nhật deck',
      description:
        'Cập nhật thông tin một deck do người dùng hiện tại sở hữu. Chỉ chủ sở hữu mới được cập nhật.',
      parameters: [deckIdParam],
      requestBody: jsonBody('UserDeckUpdateRequest'),
      responses: {
        200: jsonResponse(
          'UserDeckUpdateResponse',
          'Cập nhật deck thành công.'
        ),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: NotFound('Không tìm thấy deck'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Xóa deck',
      description:
        'Xóa một deck do người dùng hiện tại sở hữu cùng toàn bộ topic và card bên trong. Chỉ chủ sở hữu mới được xóa.',
      parameters: [deckIdParam],
      responses: {
        200: jsonResponse('SuccessResponse', 'Xóa deck thành công.'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: NotFound('Không tìm thấy deck'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  // ==================== TOPIC ====================
  '/users/me/decks/{deckId}/topics': {
    get: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Lấy danh sách topic trong deck của người dùng',
      description:
        'Trả về danh sách topic thuộc một deck do người dùng hiện tại sở hữu.',
      parameters: [deckIdParam],
      responses: {
        200: jsonResponse(
          'UserTopicListResponse',
          'Lấy danh sách topic thành công.'
        ),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: NotFound('Không tìm thấy deck'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Tạo topic mới trong deck',
      description:
        'Tạo một topic mới bên trong deck do người dùng hiện tại sở hữu.',
      parameters: [deckIdParam],
      requestBody: jsonBody('UserTopicCreateRequest'),
      responses: {
        201: jsonResponse('UserTopicMutationResponse', 'Tạo topic thành công.'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: NotFound('Không tìm thấy deck'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/users/me/decks/{deckId}/topics/{topicId}': {
    get: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Lấy chi tiết topic',
      description:
        'Trả về chi tiết một topic trong deck do người dùng hiện tại sở hữu.',
      parameters: [deckIdParam, topicIdParam],
      responses: {
        200: jsonResponse(
          'UserTopicMutationResponse',
          'Lấy chi tiết topic thành công.'
        ),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: NotFound('Không tìm thấy deck hoặc topic'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Cập nhật topic',
      description:
        'Cập nhật một topic trong deck do người dùng hiện tại sở hữu.',
      parameters: [deckIdParam, topicIdParam],
      requestBody: jsonBody('UserTopicUpdateRequest'),
      responses: {
        200: jsonResponse(
          'UserTopicMutationResponse',
          'Cập nhật topic thành công.'
        ),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: NotFound('Không tìm thấy deck hoặc topic'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Xóa topic',
      description:
        'Xóa một topic trong deck do người dùng hiện tại sở hữu cùng toàn bộ card bên trong.',
      parameters: [deckIdParam, topicIdParam],
      responses: {
        200: jsonResponse('SuccessResponse', 'Xóa topic thành công.'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: NotFound('Không tìm thấy deck hoặc topic'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  // ==================== CARD ====================
  '/users/me/decks/{deckId}/cards': {
    get: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Lấy danh sách card trong deck của người dùng',
      description:
        'Trả về danh sách card thuộc một deck do người dùng hiện tại sở hữu. Có thể lọc theo topicId.',
      parameters: [
        deckIdParam,
        {
          name: 'topicId',
          in: 'query',
          required: false,
          description: 'Lọc card theo ObjectId của topic.',
          schema: {
            type: 'string',
            pattern: '^[a-fA-F0-9]{24}$',
            example: '665f1f77bcf86cd799439041',
          },
        },
        qParam,
        pageParam,
        limitParam,
      ],
      responses: {
        200: jsonResponse(
          'UserCardListResponse',
          'Lấy danh sách card thành công.'
        ),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: NotFound('Không tìm thấy deck'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Tạo card mới trong deck',
      description:
        'Tạo một card mới bên trong deck do người dùng hiện tại sở hữu. Cần chỉ định topicId thuộc deck này.',
      parameters: [deckIdParam],
      requestBody: jsonBody('UserCardCreateRequest'),
      responses: {
        201: jsonResponse('UserCardMutationResponse', 'Tạo card thành công.'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: NotFound('Không tìm thấy deck hoặc topic'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/users/me/decks/{deckId}/cards/{cardId}': {
    get: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Lấy chi tiết card',
      description:
        'Trả về chi tiết một card trong deck do người dùng hiện tại sở hữu.',
      parameters: [deckIdParam, cardIdParam],
      responses: {
        200: jsonResponse(
          'UserCardMutationResponse',
          'Lấy chi tiết card thành công.'
        ),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: NotFound('Không tìm thấy deck hoặc card'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Cập nhật card',
      description:
        'Cập nhật một card trong deck do người dùng hiện tại sở hữu.',
      parameters: [deckIdParam, cardIdParam],
      requestBody: jsonBody('UserCardUpdateRequest'),
      responses: {
        200: jsonResponse(
          'UserCardMutationResponse',
          'Cập nhật card thành công.'
        ),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: NotFound('Không tìm thấy deck hoặc card'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Xóa card',
      description: 'Xóa một card trong deck do người dùng hiện tại sở hữu.',
      parameters: [deckIdParam, cardIdParam],
      responses: {
        200: jsonResponse('SuccessResponse', 'Xóa card thành công.'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: NotFound('Không tìm thấy deck hoặc card'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};
