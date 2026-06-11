export default {
  '/auth/signup': {
    post: {
      tags: ['Auth'],
      summary: 'Đăng ký tài khoản mới',
      description:
        'Tạo tài khoản người dùng mới. Tài khoản tạo xong sẽ ở trạng thái chưa kích hoạt (isVerified = false) và một mã OTP kích hoạt sẽ tự động được gửi qua email.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SignupPayload',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Đăng ký thành công',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SuccessResponse',
              },
            },
          },
        },
        400: {
          description: 'Dữ liệu không hợp lệ hoặc email đã tồn tại',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
};
