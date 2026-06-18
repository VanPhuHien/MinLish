import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import './ForgotPasswordPage.css'

function ForgotPasswordPage({ onNavigate }) {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (val) => {
    if (!val) {
      return 'Email không được để trống'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(val)) {
      return 'Email không đúng định dạng'
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setIsSubmitting(true)
    const result = await forgotPassword(email)

    if (result.success) {
      setSuccess(result.message || 'Mã OTP đã được gửi đến email của bạn.')
      setTimeout(() => {
        if (onNavigate) {
          // Chuyển hướng sang trang reset-password và truyền email qua tham số
          onNavigate('/reset-password', email)
        }
      }, 1500)
    } else {
      setIsSubmitting(false)
      setError(result.message)
    }
  }

  const handleBackToLogin = (e) => {
    e.preventDefault()
    if (onNavigate) onNavigate('/login')
  }

  return (
    <div className="forgot-wrapper">
      <div className="forgot-card">
        {/* Vòng tròn Icon xoay ngược */}
        <div className="forgot-icon-container">
          <svg className="forgot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <circle cx="12" cy="12" r="1" />
          </svg>
        </div>

        <h2 className="forgot-title">Quên mật khẩu</h2>
        <p className="forgot-subtitle">
          Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu.
        </p>

        {error && <div className="forgot-error-message">{error}</div>}
        {success && <div className="forgot-success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="input-group">
            <label htmlFor="email" className="input-label">EMAIL</label>
            <div className={`input-with-icon ${error ? 'input-error' : ''}`}>
              <span className="input-icon-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                disabled={isSubmitting}
                className="forgot-input-field"
              />
            </div>
          </div>

          <button type="submit" className="forgot-submit-btn" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu khôi phục'}</span>
            {!isSubmitting && (
              <svg className="forgot-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </form>

        <div className="forgot-footer">
          <a href="/login" onClick={handleBackToLogin} className="back-login-link">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Quay lại Đăng nhập
          </a>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
