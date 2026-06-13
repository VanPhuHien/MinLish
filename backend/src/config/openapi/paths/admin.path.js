const CefrNotFound = {
  description: 'Không tìm thấy CEFR level',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: { success: false, message: 'Không tìm thấy CEFR Level' },
    },
  },
};

const TagNotFound = {
  description: 'Không tìm thấy tag',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: { success: false, message: 'Không tìm thấy tag' },
    },
  },
};

const LessonOrSegmentNotFound = {
  description: 'Không tìm thấy lesson hoặc segment',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        LessonNotFound: {
          summary: 'Lỗi sai lesson ID',
          value: { success: false, message: 'Không tìm thấy lesson' },
        },
        SegmentNotFound: {
          summary: 'Lỗi sai segment ID',
          value: { success: false, message: 'Không tìm thấy segment' },
        },
      },
    },
  },
};

const SegmentOrderConflict = {
  description: 'Thứ tự segment (order) đã tồn tại',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        message: 'Thứ tự segment (order) này đã tồn tại trong lesson',
      },
    },
  },
};

export default {
  '/admin/cefr-levels': {
    get: {
      tags: ['/admin/cefr-levels'],
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
      tags: ['/admin/cefr-levels'],
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
        409: {
          $ref: '#/components/responses/Conflict',
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
      tags: ['/admin/cefr-levels'],
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
      tags: ['/admin/cefr-levels'],
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
        409: {
          $ref: '#/components/responses/Conflict',
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
      tags: ['/admin/cefr-levels'],
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
  '/admin/tags': {
    get: {
      tags: ['/admin/tags'],
      summary: 'Lấy danh sách tag',
      description: 'Lấy toàn bộ danh sách tag dành cho Admin.',
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Lấy danh sách tag thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TagsResponse',
              },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      tags: ['/admin/tags'],
      summary: 'Tạo tag mới',
      description: 'Tạo mới một tag dành cho Admin.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/TagPayload',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Tạo tag thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/TagResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Tạo tag thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        409: { $ref: '#/components/responses/Conflict' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/tags/{id}': {
    get: {
      tags: ['/admin/tags'],
      summary: 'Lấy chi tiết một Tag',
      description: 'Lấy thông tin chi tiết một tag dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của Tag',
        },
      ],
      responses: {
        200: {
          description: 'Lấy thông tin tag thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TagResponse',
              },
            },
          },
        },
        404: TagNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      tags: ['/admin/tags'],
      summary: 'Cập nhật Tag',
      description: 'Cập nhật thông tin tag dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của Tag',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/TagPayload',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Cập nhật tag thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/TagResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Cập nhật tag thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        409: { $ref: '#/components/responses/Conflict' },
        404: TagNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      tags: ['/admin/tags'],
      summary: 'Xóa tag',
      description: 'Xóa tag dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của Tag',
        },
      ],
      responses: {
        200: {
          description: 'Xóa tag thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse',
              },
            },
          },
        },
        404: TagNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/lessons/{lessonId}/segments': {
    get: {
      tags: ['/admin/lessons'],
      summary: 'Lấy danh sách segment của lesson',
      description:
        'Lấy danh sách các segment thuộc về một lesson cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
      ],
      responses: {
        200: {
          description: 'Lấy danh sách segments thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SegmentsResponse' },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      tags: ['/admin/lessons'],
      summary: 'Tạo segment mới',
      description: 'Tạo mới một segment cho một lesson cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SegmentPayload' },
          },
        },
      },
      responses: {
        201: {
          description: 'Tạo segment thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SegmentResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Tạo segment thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        409: SegmentOrderConflict,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/admin/lessons/{lessonId}/segments/{segmentId}': {
    get: {
      tags: ['/admin/lessons'],
      summary: 'Lấy chi tiết một segment',
      description:
        'Lấy thông tin chi tiết của một segment cụ thể trong một lesson cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
        {
          in: 'path',
          name: 'segmentId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của segment',
        },
      ],
      responses: {
        200: {
          description: 'Lấy thông tin segment thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SegmentResponse' },
            },
          },
        },
        404: LessonOrSegmentNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    put: {
      tags: ['/admin/lessons'],
      summary: 'Cập nhật segment',
      description:
        'Cập nhật thông tin segment cụ thể trong một lesson cụ thể dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
        {
          in: 'path',
          name: 'segmentId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của segment',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SegmentPayload' },
          },
        },
      },
      responses: {
        200: {
          description: 'Cập nhật segment thành công',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SegmentResponse' },
                  {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Cập nhật segment thành công',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        409: SegmentOrderConflict,
        404: LessonOrSegmentNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      tags: ['/admin/lessons'],
      summary: 'Xóa segment khỏi lesson',
      description: 'Xóa segment khỏi lesson dành cho Admin.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'lessonId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lesson',
        },
        {
          in: 'path',
          name: 'segmentId',
          required: true,
          schema: { type: 'string' },
          description: 'ID của segment',
        },
      ],
      responses: {
        200: {
          description: 'Xóa segment thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        404: LessonOrSegmentNotFound,
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};
