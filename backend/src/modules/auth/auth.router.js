import express from 'express';
import * as authController from './auth.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import {
  loginSchema,
  signupSchema,
  otpSendSchema,
  otpVerifySchema,
  resetPasswordSchema,
} from './auth.schema.js';
import { rateLimiter } from '../../middlewares/rateLimiter.middleware.js';
import { config } from '../../config/env.js';

const router = express.Router();

// Route đăng ký - có rate limit chống spam đăng ký tài khoản
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

// Route đăng nhập - có rate limit chống brute-force mật khẩu
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

// Route gửi mã OTP qua email
router.post('/otp/send', validate(otpSendSchema), authController.sendOtp);

// Route xác thực mã OTP
router.post('/otp/verify', validate(otpVerifySchema), authController.verifyOtp);

// Route đặt lại mật khẩu sau khi xác thực OTP thành công
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Route làm mới Access Token bằng Refresh Token trong Cookie
router.post('/refresh', authController.refresh);

// Route đăng xuất để xóa Cookie Refresh Token
router.post('/logout', authController.logout);

export default router;
