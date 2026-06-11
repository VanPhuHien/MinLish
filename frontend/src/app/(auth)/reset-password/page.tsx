import ResetPasswordForm from './ResetPasswordForm';
import AuthCard from '@/components/ui/auth-card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu – MinLish',
  description: 'Nhập mã OTP và mật khẩu mới để khôi phục tài khoản',
};

type ResetPasswordPageProps = {
  searchParams?: {
    email?: string;
  };
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const email = searchParams?.email || '';

  return (
    <AuthCard title="Nhập mã OTP và mật khẩu mới">
      <ResetPasswordForm email={email} />
    </AuthCard>
  );
}
