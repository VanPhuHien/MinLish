import { publicAccess, cookieAuth } from '../helpers/security.js';

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

const simpleSuccess = (message) => ({
  description: message,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
      example: { success: true, message },
    },
  },
});

const validationError = (fieldExample, messageExample) => ({
  description: 'Dữ liệu không hợp lệ.',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: {
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: [{ field: fieldExample, message: messageExample }],
      },
    },
  },
});

const TAG = 'Auth';

export default {
  // ==================== SIGNUP ====================
  '/auth/signup': {
    post: {
      ...publicAccess,
      tags: [TAG],
      summary: 'Đăng ký tài khoản mới',
      description:
        'Tạo tài khoản mới. Tài khoản được tạo với isVerified = false; mã OTP kích hoạt tự động gửi về email.',
      requestBody: jsonBody('SignupPayload'),
      responses: {
        201: simpleSuccess(
          'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.'
        ),
        400: validationError('email', 'Email đã được đăng ký'),
        429: {
          description: 'Quá số lần đăng ký cho phép.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message:
                  'Bạn đã đăng ký quá số lần cho phép. Vui lòng thử lại sau.',
              },
            },
          },
        },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  // ==================== LOGIN ====================
  '/auth/login': {
    post: {
      ...publicAccess,
      tags: [TAG],
      summary: 'Đăng nhập',
      description:
        'Xác thực email + password. Trả về accessToken trong body; đặt refreshToken vào httpOnly cookie (SameSite=strict, maxAge 7 ngày).',
      requestBody: jsonBody('LoginPayload'),
      responses: {
        200: jsonResponse('LoginResponse', 'Đăng nhập thành công.'),
        400: {
          description: 'Sai email/mật khẩu hoặc tài khoản chưa kích hoạt.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Email hoặc mật khẩu không chính xác',
              },
            },
          },
        },
        429: {
          description: 'Đăng nhập sai quá nhiều lần.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message:
                  'Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.',
              },
            },
          },
        },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  // ==================== REFRESH ====================
  '/auth/refresh': {
    post: {
      ...cookieAuth,
      tags: [TAG],
      summary: 'Làm mới access token',
      description:
        'Dùng refreshToken trong httpOnly cookie để cấp accessToken mới. Cookie phải được gửi kèm request (credentials: include).',
      responses: {
        200: jsonResponse('RefreshResponse', 'Làm mới token thành công.'),
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  // ==================== LOGOUT ====================
  '/auth/logout': {
    post: {
      ...publicAccess,
      tags: [TAG],
      summary: 'Đăng xuất',
      description:
        'Xóa refreshToken cookie. Client tự xóa accessToken ở localStorage. Không yêu cầu Bearer token.',
      responses: {
        200: simpleSuccess('Đăng xuất thành công'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  // ==================== VERIFY EMAIL ====================
  '/auth/verify-email/send': {
    post: {
      ...publicAccess,
      tags: [TAG],
      summary: 'Gửi lại OTP kích hoạt tài khoản',
      description:
        'Gửi lại mã OTP 6 chữ số về email để kích hoạt tài khoản. OTP được lưu Redis và hết hạn theo cấu hình.',
      requestBody: jsonBody('ResendVerifyEmailPayload'),
      responses: {
        200: simpleSuccess('Mã OTP kích hoạt đã được gửi đến email.'),
        400: validationError(
          'email',
          'Email không hợp lệ hoặc tài khoản đã được kích hoạt'
        ),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/auth/verify-email': {
    post: {
      ...publicAccess,
      tags: [TAG],
      summary: 'Xác thực OTP kích hoạt tài khoản',
      description:
        'Nhập email + OTP để kích hoạt tài khoản (isVerified = true). OTP lấy từ email sau khi gọi /auth/verify-email/send.',
      requestBody: jsonBody('VerifyEmailPayload'),
      responses: {
        200: simpleSuccess('Kích hoạt tài khoản thành công.'),
        400: {
          description: 'OTP không hợp lệ hoặc đã hết hạn.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
              },
            },
          },
        },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },

  // ==================== FORGOT / RESET PASSWORD ====================
  '/auth/forgot-password': {
    post: {
      ...publicAccess,
      tags: [TAG],
      summary: 'Yêu cầu OTP đặt lại mật khẩu',
      description:
        'Gửi mã OTP 6 chữ số về email để xác thực trước khi đặt lại mật khẩu.',
      requestBody: jsonBody('ForgotPasswordPayload'),
      responses: {
        200: simpleSuccess('Mã OTP đặt lại mật khẩu đã được gửi đến email.'),
        400: validationError('email', 'Email không tồn tại trong hệ thống'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/auth/reset-password': {
    post: {
      ...publicAccess,
      tags: [TAG],
      summary: 'Đặt lại mật khẩu',
      description:
        'Xác thực OTP và đặt mật khẩu mới. OTP phải lấy từ /auth/forgot-password trước.',
      requestBody: jsonBody('ResetPasswordPayload'),
      responses: {
        200: simpleSuccess('Đặt lại mật khẩu thành công.'),
        400: {
          description:
            'OTP không hợp lệ, đã hết hạn, hoặc mật khẩu không đủ độ dài.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
              },
            },
          },
        },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};
