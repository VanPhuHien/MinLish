import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .email({ message: 'Email không đúng định dạng' }),
  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc' })
    .min(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' }),
});

export const signupSchema = z.object({
  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .email({ message: 'Email không đúng định dạng' }),
  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc' })
    .min(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' }),
  name: z
    .string({ required_error: 'Tên là bắt buộc' })
    .min(2, { message: 'Tên phải chứa ít nhất 2 ký tự' }),
});

export const otpSendSchema = z.object({
  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .email({ message: 'Email không đúng định dạng' }),
  purpose: z.enum(['verify_email', 'forgot_password'], {
    required_error: 'Mục đích gửi OTP là bắt buộc',
    invalid_type_error: 'Mục đích không hợp lệ',
  }),
});

export const otpVerifySchema = z.object({
  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .email({ message: 'Email không đúng định dạng' }),
  otp: z
    .string({ required_error: 'Mã OTP là bắt buộc' })
    .length(6, { message: 'Mã OTP phải có đúng 6 chữ số' })
    .regex(/^\d+$/, { message: 'Mã OTP chỉ chứa ký tự số' }),
  purpose: z.enum(['verify_email', 'forgot_password'], {
    required_error: 'Mục đích xác thực OTP là bắt buộc',
    invalid_type_error: 'Mục đích không hợp lệ',
  }),
});

export const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .email({ message: 'Email không đúng định dạng' }),
  newPassword: z
    .string({ required_error: 'Mật khẩu mới là bắt buộc' })
    .min(6, { message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự' }),
});
