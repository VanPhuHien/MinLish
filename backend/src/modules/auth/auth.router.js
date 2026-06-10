import express from 'express';
import * as authController from './auth.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import {
  loginSchema,
  signupSchema,
  resendVerifyEmailSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema.js';
import { rateLimiter } from '../../middlewares/rateLimiter.middleware.js';
import { config } from '../../config/env.js';

const router = express.Router();

// Đăng ký tài khoản mới - áp dụng rate limit
router.post(
  '/signup',
  rateLimiter({
    windowMs: config.registerLimitWindowMs,
    max: config.registerLimitMax,
    message: 'Bạn đã đăng ký quá số lần cho phép. Vui lòng thử lại sau.',
  }),
  validate(signupSchema),
  authController.signup
);

// Đăng nhập - áp dụng rate limit
router.post(
  '/login',
  rateLimiter({
    windowMs: config.loginLimitWindowMs,
    max: config.loginLimitMax,
    message: 'Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.',
  }),
  validate(loginSchema),
  authController.login
);

// Gửi lại mã OTP kích hoạt tài khoản
router.post('/verify-email/send', validate(resendVerifyEmailSchema), authController.sendVerificationEmail);

// Xác thực OTP kích hoạt tài khoản
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

// Yêu cầu OTP khi quên mật khẩu
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// Đặt lại mật khẩu mới kèm OTP xác thực
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Làm mới Access Token
router.post('/refresh', authController.refresh);

// Đăng xuất
router.post('/logout', authController.logout);

export default router;
