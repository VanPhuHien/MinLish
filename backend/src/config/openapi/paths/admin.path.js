const CefrNotFound = {
  description: 'Không tìm thấy CEFR Level',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: { success: false, message: 'Không tìm thấy CEFR Level' },
    },
  },
};

export default {
  '/admin/cefr-levels': {
    get: {
      tags: ['Admin'],
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
      tags: ['Admin'],
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
        400: {
          $ref: '#/components/responses/BadRequest',
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
  },
  '/admin/cefr-levels/{id}': {
    get: {
      tags: ['Admin'],
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
      tags: ['Admin'],
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
        400: {
          $ref: '#/components/responses/BadRequest',
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
    delete: {
      tags: ['Admin'],
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
};
