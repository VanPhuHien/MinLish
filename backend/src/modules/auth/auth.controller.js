import * as authService from './auth.service.js';
import { successResponse } from '../../utils/response.js';

export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const user = await authService.signup(email, password, name);
    res.status(201).json(
      successResponse(
        'Đăng ký tài khoản thành công. Mã OTP kích hoạt đã được gửi đến email của bạn.',
        { user }
      )
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Thiết lập cookie chứa refresh token bảo mật
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.status(200).json(
      successResponse('Đăng nhập thành công', {
        accessToken: result.accessToken,
        user: result.user,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const sendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.sendVerificationEmail(email);
    res.status(200).json(successResponse(result.message || 'Mã OTP kích hoạt đã được gửi'));
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyEmail(email, otp);
    res.status(200).json(successResponse(result.message || 'Kích hoạt tài khoản thành công'));
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(successResponse(result.message || 'Mã OTP đặt lại mật khẩu đã được gửi'));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    res.status(200).json(successResponse(result.message || 'Đặt lại mật khẩu thành công'));
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result = await authService.refreshTokens(refreshToken);

    // Cập nhật cookie mới
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json(
      successResponse('Làm mới token thành công', {
        accessToken: result.accessToken,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Xóa cookie refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json(successResponse('Đăng xuất thành công'));
  } catch (error) {
    next(error);
  }
};
