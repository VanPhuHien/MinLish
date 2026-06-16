import { bearerAuth } from '../helpers/security.js';

const TAG = 'File / S3';

export default {
  '/s3/presigned-url': {
    post: {
      ...bearerAuth,
      tags: [TAG],
      summary: 'Tạo presigned URL để upload thẳng lên S3',
      description:
        'Trả về một URL PUT ký sẵn (hết hạn 60s) để client upload file trực tiếp lên S3. Client KHÔNG gửi bytes tới endpoint này — chỉ gửi mô tả file. Key sinh ở server (scope theo userId), contentType bị khóa vào chữ ký.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PresignedUrlRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Tạo presigned URL thành công.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PresignedUrlResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};
