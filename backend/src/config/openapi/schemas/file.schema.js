export default {
  PresignedUrlRequest: {
    type: 'object',
    required: ['contentType', 'purpose'],
    properties: {
      contentType: {
        type: 'string',
        description: 'MIME type của file sắp upload; phải khớp khi PUT lên S3.',
        example: 'audio/webm',
      },
      purpose: {
        type: 'string',
        enum: ['shadowing-audio', 'deck-import', 'card-image'],
        description:
          'Loại nội dung; quyết định prefix key, whitelist contentType và giới hạn size.',
        example: 'shadowing-audio',
      },
      fileSize: {
        type: 'integer',
        description: 'Kích thước file (byte) để validate giới hạn (tùy chọn).',
        example: 245678,
      },
    },
  },
  PresignedUrlResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      code: { type: 'string', example: 'PRESIGNED_URL_SUCCESS' },
      message: { type: 'string', example: 'Presigned URL created successfully' },
      data: {
        type: 'object',
        properties: {
          uploadUrl: {
            type: 'string',
            description: 'URL PUT ký sẵn để upload bytes trực tiếp lên S3.',
            example:
              'https://bucket.s3.region.amazonaws.com/shadowing/<userId>/<rand>.webm?X-Amz-Signature=...',
          },
          key: {
            type: 'string',
            description:
              'Key của object trên S3; gửi lại ở bước /s3/confirm sau khi PUT xong.',
            example: 'shadowing/665f.../a3f9.webm',
          },
          expiresIn: {
            type: 'integer',
            description: 'Số giây URL còn hiệu lực.',
            example: 60,
          },
        },
      },
    },
  },
  ConfirmUploadRequest: {
    type: 'object',
    required: ['key', 'purpose'],
    properties: {
      key: {
        type: 'string',
        description: 'Key trả về từ /s3/presigned-url, sau khi đã PUT lên S3.',
        example: 'cards/665f.../a3f9.png',
      },
      purpose: {
        type: 'string',
        enum: ['shadowing-audio', 'card-image'],
        description:
          'Loại nội dung; quyết định resource được cập nhật. card-image chỉ admin.',
        example: 'card-image',
      },
      resourceId: {
        type: 'string',
        description:
          'ID resource đích: cardId (card-image) hoặc segmentId (shadowing-audio).',
        example: '665f1a2b3c4d5e6f7a8b9c0d',
      },
    },
  },
  ConfirmUploadResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      code: { type: 'string', example: 'UPLOAD_CONFIRMED' },
      message: { type: 'string', example: 'Upload confirmed successfully' },
      data: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            example: 'cards/665f.../a3f9.png',
          },
          url: {
            type: 'string',
            description: 'URL public/CDN đã lưu vào resource; client đọc trực tiếp.',
            example:
              'https://minlish-english-learning.s3.us-east-1.amazonaws.com/cards/665f.../a3f9.png',
          },
        },
      },
    },
  },
};
