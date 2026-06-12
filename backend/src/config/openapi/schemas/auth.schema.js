export default {
  User: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      role: { type: 'string', enum: ['user', 'admin'] },
      avatarUrl: { type: 'string' },
      isVerified: { type: 'boolean' },
    },
  },
  SignupPayload: {
    type: 'object',
    required: ['email', 'password', 'name'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      password: {
        type: 'string',
        format: 'password',
        minLength: 6,
        example: 'password123',
      },
      name: { type: 'string', minLength: 2, example: 'Nguyen Van A' },
    },
  },
  LoginPayload: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      password: {
        type: 'string',
        format: 'password',
        example: 'password123',
      },
    },
  },
  ResendVerifyEmailPayload: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
    },
  },
  VerifyEmailPayload: {
    type: 'object',
    required: ['email', 'otp'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      otp: { type: 'string', length: 6, example: '123456' },
    },
  },
  ForgotPasswordPayload: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
    },
  },
  ResetPasswordPayload: {
    type: 'object',
    required: ['email', 'otp', 'newPassword'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      otp: { type: 'string', length: 6, example: '123456' },
      newPassword: {
        type: 'string',
        format: 'password',
        minLength: 6,
        example: 'newpassword123',
      },
    },
  },
};
