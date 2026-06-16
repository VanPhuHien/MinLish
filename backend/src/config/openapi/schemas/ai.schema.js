export default {
  AiRequestPayload: {
    type: 'object',
    required: ['question'],
    properties: {
      mode: {
        type: 'string',
        enum: ['minlish', 'network'],
        example: 'minlish',
        description:
          'Chế độ sinh câu trả lời - minlish: tra cứu dựa trên dữ liệu hệ thống (từ vựng, bài học), network: tra cứu tự do.',
        default: 'network',
      },
      question: {
        type: 'string',
        example: 'Nghĩa của từ twins',
        description: 'Câu hỏi của người dùng gửi cho AI.',
      },
    },
  },
  AiResponseData: {
    type: 'object',
    properties: {
      isValidQuestion: {
        type: 'boolean',
        example: true,
        description:
          'Câu hỏi có hợp lệ hay không (hợp lệ khi hỏi về các câu hỏi liên quan đến việc học tiếng anh).',
      },
      answer: {
        type: 'string',
        example: 'Twins là danh từ, nghĩa là cặp song sinh hoặc sinh đôi.',
        description: 'Câu trả lời từ AI.',
      },
    },
  },
  AiResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { $ref: '#/components/schemas/AiResponseData' },
    },
  },
};
