import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import './ResetPasswordPage.css'

function ResetPasswordPage({ email = 'user@example.com', onNavigate }) {
  const { resetPassword, forgotPassword } = useAuth()

  // State cho Step 1 (OTP)
  const [otp, setOtp] = useState(Array(6).fill(''))
  const cooldownSetting = Number(import.meta.env.OTP_RESEND_COOLDOWN) || 60
  const [timeLeft, setTimeLeft] = useState(cooldownSetting)
  const otpInputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  // State cho Step 2 (Mật khẩu mới)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // State thông báo & loading
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tự động focus vào ô OTP đầu tiên khi render
  useEffect(() => {
    if (otpInputRefs[0].current) {
      otpInputRefs[0].current.focus()
    }
  }, [])

  // Đếm ngược gửi lại mã OTP
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  // Xử lý khi thay đổi giá trị ô OTP
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return // Chỉ nhận số

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (error) setError('')

    // Tự động chuyển focus sang ô tiếp theo
    if (value && index < 5) {
      otpInputRefs[index + 1].current.focus()
    }
  }

  // Xử lý phím Backspace trong ô OTP
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        otpInputRefs[index - 1].current.focus()
      } else if (otp[index]) {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
      if (error) setError('')
    }
  }

  // Xử lý dán (paste) chuỗi OTP 6 số
  const handleOtpPaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(text)) {
      const newOtp = text.split('')
      setOtp(newOtp)
      otpInputRefs[5].current.focus()
      if (error) setError('')
    }
  }

  // Gửi lại mã OTP
  const handleResendOtp = async (e) => {
    e.preventDefault()
    if (timeLeft > 0) return

    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    const result = await forgotPassword(email)
    setIsSubmitting(false)

    if (result.success) {
      setSuccessMessage(result.message || 'Mã OTP mới đã được gửi thành công.')
      setTimeLeft(cooldownSetting)
      setOtp(Array(6).fill(''))
      if (otpInputRefs[0].current) {
        otpInputRefs[0].current.focus()
      }
    } else {
      setError(result.message)
    }
  }

  // Xử lý khi bấm nút Đặt lại/Cập nhật mật khẩu
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    // Validate mã OTP
    const otpCode = otp.join('')
    if (otpCode.length < 6) {
      setError('Vui lòng nhập đầy đủ mã xác thực gồm 6 chữ số ở Bước 1.')
      return
    }

    // Validate mật khẩu mới
    if (!newPassword) {
      setError('Mật khẩu mới không được để trống ở Bước 2.')
      return
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải chứa ít nhất 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.')
      return
    }

    setIsSubmitting(true)
    const result = await resetPassword(email, otpCode, newPassword)

    if (result.success) {
      setSuccessMessage('Cập nhật mật khẩu thành công! Đang chuyển hướng về trang Đăng nhập...')
      setTimeout(() => {
        if (onNavigate) onNavigate('/login')
      }, 1500)
    } else {
      setIsSubmitting(false)
      setError(result.message)
    }
  }

  const handleEditEmail = (e) => {
    e.preventDefault()
    if (onNavigate) onNavigate('/forgot-password')
  }

  const handleBackToLogin = (e) => {
    e.preventDefault()
    if (onNavigate) onNavigate('/login')
  }

  return (
    <div className="reset-wrapper">
      <div className="reset-card">
        {/* Vòng tròn Shield-checkmark trên đỉnh Card */}
        <div className="reset-icon-container">
          <svg className="reset-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 11 2 2 4-4" />
          </svg>
        </div>

        <h2 className="reset-title">Cập nhật tài khoản</h2>
        <p className="reset-subtitle">Xác thực OTP và thiết lập mật khẩu mới của bạn</p>

        {error && <div className="reset-error-message">{error}</div>}
        {successMessage && <div className="reset-success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="reset-form">

          {/* STEP 1: XÁC THỰC OTP */}
          <div className="step-section">
            <h3 className="step-title">
              <span className="step-number">1</span> Xác thực OTP
            </h3>

            <div className="step-email-row">
              <a href="/forgot-password" onClick={handleEditEmail} className="edit-email-link">
                <svg className="edit-email-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Sai email? Nhập lại email
              </a>
            </div>

            <p className="step-desc">Vui lòng nhập mã 6 chữ số đã được gửi đến email</p>

            <div className="otp-container" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  ref={otpInputRefs[index]}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="otp-box-field"
                  autoComplete="off"
                  inputMode="numeric"
                  disabled={isSubmitting}
                />
              ))}
            </div>

            <div className="otp-resend-row">
              {timeLeft > 0 ? (
                <span className="resend-cooldown-text">Gửi lại mã sau ({timeLeft}s)</span>
              ) : (
                <a href="/" onClick={handleResendOtp} className="resend-link">
                  Gửi lại mã
                </a>
              )}
            </div>
          </div>

          <div className="step-divider"></div>

          {/* STEP 2: THIẾT LẬP MẬT KHẨU MỚI */}
          <div className="step-section">
            <h3 className="step-title">
              <span className="step-number">2</span> Thiết lập mật khẩu mới
            </h3>

            <div className="input-group">
              <label htmlFor="newPassword" className="input-label">Mật khẩu mới</label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </span>
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ít nhất 6 ký tự"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    if (error) setError('')
                  }}
                  disabled={isSubmitting}
                  className="reset-input-field"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <label htmlFor="confirmPassword" className="input-label">Xác nhận mật khẩu mới</label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (error) setError('')
                  }}
                  disabled={isSubmitting}
                  className="reset-input-field"
                />
              </div>
            </div>

            {/* Hint Box */}
            <div className="password-hint-box">
              <svg className="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Mật khẩu nên bao gồm cả chữ cái và số để bảo mật tốt nhất.</span>
            </div>
          </div>

          <button type="submit" className="reset-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>

        <div className="reset-footer">
          <a href="/login" onClick={handleBackToLogin} className="back-login-link">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Quay lại trang đăng nhập
          </a>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
