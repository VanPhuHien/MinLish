import { bearerAuth, optionalBearerAuth } from '../helpers/security.js';

export default {
  '/decks': {
    get: {
      ...optionalBearerAuth,
      tags: ['Deck'],
      summary: 'Lấy danh sách deck đã công khai',
      description:
        'Trả về danh sách deck đã công khai. Không bắt buộc đăng nhập; nếu gửi Bearer token hợp lệ thì response sẽ bao gồm deck của người dùng hiện tại.',
      parameters: [
        {
          name: 'tagId',
          in: 'query',
          required: false,
          description: 'Lọc danh sách deck theo ObjectId của tag.',
          schema: {
            type: 'string',
            pattern: '^[a-fA-F0-9]{24}$',
            example: '665f1f77bcf86cd799439011',
          },
        },
        {
          name: 'cefrLevelId',
          in: 'query',
          required: false,
          description: 'Lọc danh sách deck theo ObjectId của cấp độ CEFR.',
          schema: {
            type: 'string',
            pattern: '^[a-fA-F0-9]{24}$',
            example: '665f1f77bcf86cd799439012',
          },
        },
        {
          name: 'q',
          in: 'query',
          required: false,
          description: 'Từ khóa tìm kiếm theo tiêu đề hoặc mô tả.',
          schema: {
            type: 'string',
            example: 'travel',
          },
        },
        {
          name: 'page',
          in: 'query',
          required: false,
          description: 'Số trang cần lấy.',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
            example: 1,
          },
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          description: 'Số lượng deck trên mỗi trang.',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            example: 10,
          },
        },
      ],
      responses: {
        200: {
          description: 'Lấy danh sách deck thành công.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DeckListResponse',
              },
            },
          },
        },
        400: {
          description: 'Tham số truy vấn không hợp lệ.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: [
                  {
                    field: 'page',
                    message: 'page phải là số nguyên lớn hơn hoặc bằng 1',
                  },
                ],
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        500: {
          $ref: '#/components/responses/ServerError',
        },
      },
    },
  },
  '/decks/{deckId}': {
    get: {
      ...bearerAuth,
      tags: ['Deck'],
      summary: 'Lấy chi tiết deck',
      description:
        'Trả về thông tin chi tiết của một deck. Yêu cầu đăng nhập bằng Bearer token.',
      parameters: [
        {
          name: 'deckId',
          in: 'path',
          required: true,
          description: 'ObjectId của deck cần lấy chi tiết.',
          schema: {
            type: 'string',
            pattern: '^[a-fA-F0-9]{24}$',
            example: '665f1f77bcf86cd799439031',
          },
        },
      ],
      responses: {
        200: {
          description: 'Lấy chi tiết deck thành công.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DeckDetailResponse',
              },
            },
          },
        },
        400: {
          description: 'deckId không hợp lệ.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: [
                  {
                    field: 'deckId',
                    message: 'deckId không đúng định dạng ObjectId',
                  },
                ],
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        404: {
          description: 'Không tìm thấy deck.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Không tìm thấy deck',
              },
            },
          },
        },
        500: {
          $ref: '#/components/responses/ServerError',
        },
      },
    },
  },
  '/decks/{deckId}/topics': {
    get: {
      ...bearerAuth,
      tags: ['Deck'],
      summary: 'Lấy danh sách topic trong deck',
      description:
        'Trả về danh sách topic thuộc một deck kèm tiến độ học của người dùng hiện tại. Yêu cầu đăng nhập bằng Bearer token.',
      parameters: [
        {
          name: 'deckId',
          in: 'path',
          required: true,
          description: 'ObjectId của deck cần lấy danh sách topic.',
          schema: {
            type: 'string',
            pattern: '^[a-fA-F0-9]{24}$',
            example: '665f1f77bcf86cd799439031',
          },
        },
      ],
      responses: {
        200: {
          description: 'Lấy danh sách topic trong deck thành công.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DeckTopicListResponse',
              },
            },
          },
        },
        400: {
          description: 'deckId không hợp lệ.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: [
                  {
                    field: 'deckId',
                    message: 'deckId không đúng định dạng ObjectId',
                  },
                ],
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        404: {
          description: 'Không tìm thấy deck hoặc topic.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Không tìm thấy deck hoặc topic',
              },
            },
          },
        },
        500: {
          $ref: '#/components/responses/ServerError',
        },
      },
    },
  },
  '/decks/{deckId}/topics/{topicId}/cards': {
    get: {
      ...bearerAuth,
      tags: ['Deck'],
      summary: 'Lấy danh sách card trong topic',
      description:
        'Trả về danh sách card thuộc một topic trong deck kèm trạng thái học của người dùng hiện tại. Yêu cầu đăng nhập bằng Bearer token.',
      parameters: [
        {
          name: 'deckId',
          in: 'path',
          required: true,
          description: 'ObjectId của deck chứa topic.',
          schema: {
            type: 'string',
            pattern: '^[a-fA-F0-9]{24}$',
            example: '665f1f77bcf86cd799439031',
          },
        },
        {
          name: 'topicId',
          in: 'path',
          required: true,
          description: 'ObjectId của topic cần lấy danh sách card.',
          schema: {
            type: 'string',
            pattern: '^[a-fA-F0-9]{24}$',
            example: '665f1f77bcf86cd799439041',
          },
        },
      ],
      responses: {
        200: {
          description: 'Lấy danh sách card trong topic thành công.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DeckTopicCardListResponse',
              },
            },
          },
        },
        400: {
          description: 'deckId hoặc topicId không hợp lệ.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: [
                  {
                    field: 'topicId',
                    message: 'topicId không đúng định dạng ObjectId',
                  },
                ],
              },
            },
          },
        },
        401: {
          $ref: '#/components/responses/Unauthorized',
        },
        404: {
          description: 'Không tìm thấy deck, topic hoặc card.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                message: 'Không tìm thấy deck, topic hoặc card',
              },
            },
          },
        },
        500: {
          $ref: '#/components/responses/ServerError',
        },
      },
    },
  },
};
