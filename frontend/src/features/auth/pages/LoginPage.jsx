import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import Input from '../../../components/Input/Input'
import './LoginPage.css'

function LoginPage({ onNavigate }) {
  const { login, resendOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu')
      return
    }

    setIsSubmitting(true)
    const result = await login(email, password)
    setIsSubmitting(false)

    if (result.success) {
      if (onNavigate) onNavigate('/')
    } else {
      if (result.notVerified) {
        // Tự động gọi API gửi yêu cầu verify email
        await resendOtp(email)
        // Chuyển hướng sang trang verify-email kèm email
        if (onNavigate) onNavigate('/verify-email', email)
      } else {
        setError(result.message)
      }
    }
  }

  const handleSignupClick = (e) => {
    e.preventDefault()
    if (onNavigate) onNavigate('/signup')
  }

  const handleForgotPasswordClick = (e) => {
    e.preventDefault()
    if (onNavigate) onNavigate('/forgot-password')
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Chào mừng quay trở lại</h2>
        <p className="login-subtitle">Vui lòng đăng nhập để tiếp tục</p>

        {error && <div className="login-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            disabled={isSubmitting}
          />

          <Input
            id="password"
            label="Mật khẩu"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError('')
            }}
            rightElement={
              <a href="/" onClick={handleForgotPasswordClick} tabIndex={-1}>
                Quên mật khẩu?
              </a>
            }
            disabled={isSubmitting}
          />

          <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
            {!isSubmitting && (
              <svg className="login-btn-icon" viewBox="0 0 24 24">
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            )}
          </button>
        </form>

        <div className="login-footer">
          <span>Chưa có tài khoản? </span>
          <a href="/signup" onClick={handleSignupClick} className="register-link">
            Đăng ký ngay
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
