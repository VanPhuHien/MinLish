const AiBadRequest = {
  description: 'Dữ liệu đầu vào không hợp lệ',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      examples: {
        MissingQuestion: {
          summary: 'Thiếu câu hỏi',
          value: {
            success: false,
            message: 'Bắt buộc nhập câu hỏi',
          },
        },
      },
    },
  },
};

export default {
  '/ai/response': {
    post: {
      tags: ['AI Assistant'],
      summary: 'Sinh câu trả lời với AI Assistant',
      description:
        'Gửi câu hỏi tới AI để nhận câu trả lời. Có 2 chế độ: minlish (tìm kiếm trong dữ liệu bài học/từ vựng nội bộ) và network (tìm kiếm tự do trên mạng). Mặc định là minlish.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AiRequestPayload' },
            examples: {
              MinlishMode: {
                summary: 'Chế độ Minlish',
                value: {
                  mode: 'minlish',
                  question: 'dịch câu Nice to meet you, Duy',
                },
              },
              NetworkMode: {
                summary: 'Chế độ Network',
                value: {
                  mode: 'network',
                  question: 'dịch câu Nice to meet you, Duy',
                },
              },
              IrrelevantQuestion: {
                summary: 'Câu hỏi không liên quan (Network)',
                value: {
                  mode: 'network',
                  question: 'Tối nay nên ăn gì?',
                },
              },
              MinlishNoKeyword: {
                summary: 'Câu hỏi không chứa từ khoá (Minlish)',
                value: {
                  mode: 'minlish',
                  question: 'Giúp tôi với!',
                },
              },
              QuestionMissing: {
                summary: 'Gửi thiếu câu hỏi',
                value: {
                  mode: 'minlish',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Sinh câu trả lời thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AiResponse' },
              examples: {
                MinlishNoData: {
                  summary: 'Chế độ Minlish: Không có dữ liệu',
                  value: {
                    success: true,
                    data: {
                      isValidQuestion: true,
                      answer:
                        'Hệ thống MinLish hiện tại chưa có dữ liệu nào khớp với câu hỏi của bạn. Hãy thử chuyển sang chế độ tìm kiếm trên mạng!',
                    },
                  },
                },
                NetworkSuccess: {
                  summary: 'Chế độ Network: Trả lời thành công',
                  value: {
                    success: true,
                    data: {
                      isValidQuestion: true,
                      answer:
                        'Câu đó dịch sang tiếng Việt là: "Rất vui được gặp bạn, Duy" hoặc "Rất vui được gặp Duy".',
                    },
                  },
                },
                InvalidQuestion: {
                  summary: 'Câu hỏi không hợp lệ',
                  value: {
                    success: true,
                    data: {
                      isValidQuestion: false,
                      answer: 'Câu hỏi không hợp lệ',
                    },
                  },
                },
                MinlishNoKeyword: {
                  summary: 'Chế độ Minlish: Không tìm thấy từ khóa',
                  value: {
                    success: true,
                    data: {
                      isValidQuestion: false,
                      answer:
                        'Không tìm thấy từ khóa hợp lệ trong câu hỏi để tra cứu hệ thống.',
                    },
                  },
                },
              },
            },
          },
        },
        400: AiBadRequest,
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/ai/cards/auto-fill': {
    post: {
      tags: ['AI Assistant'],
      summary: 'Tự động điền thẻ từ vựng bằng AI',
      description:
        'Dựa vào từ vựng hoặc nghĩa tiếng Việt để tự động sinh ra các trường dữ liệu còn thiếu cho thẻ từ vựng (phát âm, từ loại, giải thích, ví dụ...).',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['word'],
              properties: {
                word: {
                  type: 'string',
                  example: 'apple',
                  description: 'Từ vựng tiếng Anh hoặc nghĩa tiếng Việt',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Auto fill thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CardAutoFillResponse',
              },
            },
          },
        },
        400: {
          description: 'Dữ liệu không hợp lệ',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                code: 'INVALID_DATA',
                message: 'Invalid request data',
                errors: [
                  { field: 'word', message: 'The word field is required' },
                ],
              },
            },
          },
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};
