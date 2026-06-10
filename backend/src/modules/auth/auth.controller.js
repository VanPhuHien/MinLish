import * as authService from './auth.service.js';
import { successResponse } from '../../utils/response.js';

export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const user = await authService.signup(email, password, name);
    res.status(201).json(
      successResponse(
        'Đăng ký tài khoản thành công. Vui lòng kiểm tra email để nhận mã OTP kích hoạt tài khoản.',
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

export const sendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;
    const result = await authService.sendOtp(email, purpose);
    res.status(200).json(successResponse(result.message || 'Gửi OTP thành công'));
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;
    const result = await authService.verifyOtp(email, otp, purpose);
    res.status(200).json(successResponse(result.message || 'Xác thực OTP thành công'));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const result = await authService.resetPassword(email, newPassword);
    res.status(200).json(successResponse(result.message || 'Đặt lại mật khẩu thành công'));
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result = await authService.refreshTokens(refreshToken);

    // Xoay vòng Refresh token bằng cách cập nhật cookie mới
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
