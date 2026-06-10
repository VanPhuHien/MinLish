import bcrypt from 'bcrypt';
import User from '../../models/user.model.js';
import { generateToken, verifyToken } from '../../utils/jwt.js';
import { config } from '../../config/env.js';
import redisClient from '../../config/redis.js';
import AppError from '../../utils/AppError.js';
import { sendOtpEmail, sendForgotPasswordEmail } from '../../utils/mail.util.js';

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
    throw new AppError('Tài khoản chưa được kích hoạt, vui lòng xác thực OTP', 403);
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

export const sendOtp = async (email, purpose) => {
  if (!redisClient.isOpen) {
    throw new AppError('Hệ thống tạm thời gián đoạn, vui lòng thử lại sau', 500);
  }

  if (purpose === 'forgot_password') {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Không tìm thấy tài khoản với email này', 404);
    }
    if (!user.isActive) {
      throw new AppError('Tài khoản này đã bị khóa', 403);
    }
  } else if (purpose === 'verify_email') {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Không tìm thấy tài khoản với email này', 404);
    }
    if (user.isVerified) {
      throw new AppError('Tài khoản này đã được kích hoạt trước đó', 400);
    }
  }

  // Sinh mã OTP 6 chữ số
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const redisKey = `otp:${purpose}:${email}`;
  // Lưu OTP vào Redis với thời gian hết hạn là 10 phút (600 giây)
  await redisClient.set(redisKey, otp, { EX: 600 });

  // Gửi OTP qua email
  if (purpose === 'verify_email') {
    await sendOtpEmail(email, otp);
  } else if (purpose === 'forgot_password') {
    await sendForgotPasswordEmail(email, otp);
  }

  return { message: 'Mã OTP đã được gửi' };
};

export const verifyOtp = async (email, otp, purpose) => {
  if (!redisClient.isOpen) {
    throw new AppError('Hệ thống cache tạm thời gián đoạn, vui lòng thử lại sau', 500);
  }

  const redisKey = `otp:${purpose}:${email}`;
  const cachedOtp = await redisClient.get(redisKey);

  if (!cachedOtp || cachedOtp !== otp) {
    throw new AppError('Mã OTP không hợp lệ hoặc đã hết hạn', 400);
  }

  // OTP chính xác, xóa khỏi Redis
  await redisClient.del(redisKey);

  if (purpose === 'verify_email') {
    const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    if (!user) {
      throw new AppError('Không tìm thấy tài khoản để kích hoạt', 404);
    }
  } else if (purpose === 'forgot_password') {
    // Lưu quyền được reset password cho email này trong vòng 5 phút (300 giây)
    const resetStatusKey = `reset_status:${email}`;
    await redisClient.set(resetStatusKey, 'verified', { EX: 300 });
  }

  return { message: 'Xác thực mã OTP thành công' };
};

export const resetPassword = async (email, newPassword) => {
  if (!redisClient.isOpen) {
    throw new AppError('Hệ thống cache tạm thời gián đoạn, vui lòng thử lại sau', 500);
  }

  const resetStatusKey = `reset_status:${email}`;
  const resetStatus = await redisClient.get(resetStatusKey);

  if (!resetStatus || resetStatus !== 'verified') {
    throw new AppError('Phiên xác thực đã hết hạn hoặc không hợp lệ. Vui lòng gửi và xác thực OTP lại', 400);
  }

  // Cập nhật mật khẩu mới
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  const user = await User.findOneAndUpdate({ email }, { passwordHash }, { new: true });
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', 404);
  }

  // Xóa trạng thái cho phép reset password
  await redisClient.del(resetStatusKey);

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
