import bcrypt from 'bcrypt';
import User from '../../models/user.model.js';
import { generateToken, verifyToken } from '../../utils/jwt.js';
import { config } from '../../config/env.js';
import redisClient from '../../config/redis.js';
import AppError from '../../utils/AppError.js';
import { sendOtpEmail, sendForgotPasswordEmail } from '../../utils/mail.util.js';

// Helper sinh mã OTP 6 chữ số
const generateOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const signup = async (email, password, name) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email đã được đăng ký', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    passwordHash,
    name,
    role: 'user',
    isVerified: false,
    isActive: true,
  });

  const otp = generateOtpCode();
  const redisKey = `otp:verify_email:${email}`;
  await redisClient.set(redisKey, otp, { EX: config.otpTTL });

  sendOtpEmail(email, otp).catch((error) => {
    console.error('Lỗi gửi email kích hoạt ngầm:', error);
  });

  return {
    id: user._id,
    email: user.email,
    name: user.name,
  };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Email hoặc mật khẩu không chính xác', 400);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Email hoặc mật khẩu không chính xác', 400);
  }

  if (!user.isVerified) {
    throw new AppError('Tài khoản chưa được kích hoạt, vui lòng xác thực email', 403);
  }

  if (!user.isActive) {
    throw new AppError(`Tài khoản đã bị khóa${user.banReason ? ': ' + user.banReason : ''}`, 403);
  }

  const accessToken = generateToken(
    { id: user._id, role: user.role, type: 'ACCESS' },
    config.jwtAccessExpiresIn
  );

  const refreshToken = generateToken(
    { id: user._id, role: user.role, type: 'REFRESH' },
    config.jwtRefreshExpiresIn
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
    },
  };
};

export const sendVerificationEmail = async (email) => {
  if (!redisClient.isOpen) {
    throw new AppError('Hệ thống tạm thời gián đoạn, vui lòng thử lại sau', 500);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Không tìm thấy tài khoản với email này', 404);
  }
  if (user.isVerified) {
    throw new AppError('Tài khoản đã được kích hoạt trước đó', 400);
  }

  const otp = generateOtpCode();
  const redisKey = `otp:verify_email:${email}`;
  await redisClient.set(redisKey, otp, { EX: config.otpTTL });

  sendOtpEmail(email, otp).catch((error) => {
    console.error('Lỗi gửi email:', error);
  });

  return { message: 'Mã OTP kích hoạt tài khoản đã được gửi' };
};

export const verifyEmail = async (email, otp) => {
  if (!redisClient.isOpen) {
    throw new AppError('Hệ thống tạm thời gián đoạn, vui lòng thử lại sau', 500);
  }

  const redisKey = `otp:verify_email:${email}`;
  const cachedOtp = await redisClient.get(redisKey);

  if (!cachedOtp || cachedOtp !== otp) {
    throw new AppError('Mã OTP không hợp lệ hoặc đã hết hạn', 400);
  }

  // Xác thực đúng, cập nhật DB và xóa OTP
  const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
  if (!user) {
    throw new AppError('Không tìm thấy tài khoản để kích hoạt', 404);
  }

  await redisClient.del(redisKey);
  return { message: 'Kích hoạt tài khoản thành công' };
};

export const forgotPassword = async (email) => {
  if (!redisClient.isOpen) {
    throw new AppError('Hệ thống tạm thời gián đoạn, vui lòng thử lại sau', 500);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Không tìm thấy tài khoản với email này', 404);
  }
  if (!user.isActive) {
    throw new AppError('Tài khoản này đã bị khóa', 403);
  }

  const otp = generateOtpCode();
  const redisKey = `otp:forgot_password:${email}`;
  await redisClient.set(redisKey, otp, { EX: config.otpTTL });

  sendForgotPasswordEmail(email, otp).catch((error) => {
    console.error('Lỗi gửi email đặt lại mật khẩu:', error);
  });

  return { message: 'Mã OTP đặt lại mật khẩu đã được gửi' };
};

export const resetPassword = async (email, otp, newPassword) => {
  if (!redisClient.isOpen) {
    throw new AppError('Hệ thống tạm thời gián đoạn, vui lòng thử lại sau', 500);
  }

  const redisKey = `otp:forgot_password:${email}`;
  const cachedOtp = await redisClient.get(redisKey);

  if (!cachedOtp || cachedOtp !== otp) {
    throw new AppError('Mã OTP không hợp lệ hoặc đã hết hạn', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  const user = await User.findOneAndUpdate({ email }, { passwordHash }, { new: true });
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }

  await redisClient.del(redisKey);
  return { message: 'Đặt lại mật khẩu thành công' };
};

export const refreshTokens = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token là bắt buộc', 401);
  }

  let decoded;
  try {
    decoded = verifyToken(refreshToken);
  } catch (error) {
    throw new AppError('Refresh token không hợp lệ hoặc đã hết hạn', 401);
  }

  if (decoded.type !== 'REFRESH') {
    throw new AppError('Token không hợp lệ', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('Người dùng không tồn tại hoặc đã bị xóa khỏi hệ thống', 401);
  }

  if (!user.isActive) {
    throw new AppError(`Tài khoản đã bị khóa${user.banReason ? ': ' + user.banReason : ''}`, 403);
  }

  const accessToken = generateToken(
    { id: user._id, role: user.role, type: 'ACCESS' },
    config.jwtAccessExpiresIn
  );

  const newRefreshToken = generateToken(
    { id: user._id, role: user.role, type: 'REFRESH' },
    config.jwtRefreshExpiresIn
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};
