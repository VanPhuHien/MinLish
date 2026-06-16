import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import Input from '../../../components/Input/Input'
import './SignupPage.css'

function SignupPage({ onNavigate }) {
  const { signup } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống'
    }

    if (!email) {
      newErrors.email = 'Email không được để trống'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        newErrors.email = 'Email không hợp lệ'
      }
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống'
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải chứa tối thiểu 6 ký tự'
    }

    if (password && confirmPassword !== password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')
    
    if (validate()) {
      setIsSubmitting(true)
      const result = await signup(fullName, email, password)
      setIsSubmitting(false)

      if (result.success) {
        if (onNavigate) onNavigate('/verify-email', email)
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          const apiErrors = {}
          result.errors.forEach((err) => {
            // map trường từ API (ví dụ name/email/password) sang UI
            const fieldMap = {
              name: 'fullName',
              email: 'email',
              password: 'password'
            }
            const localField = fieldMap[err.field] || err.field
            apiErrors[localField] = err.message
          })
          setErrors(apiErrors)
        } else {
          setGeneralError(result.message)
        }
      }
    }
  }

  const handleLoginClick = (e) => {
    e.preventDefault()
    if (onNavigate) onNavigate('/login')
  }

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <h2 className="signup-title">Tạo tài khoản mới</h2>
        <p className="signup-subtitle">Tham gia MinLish để bắt đầu học</p>

        {generalError && <div className="signup-error-message">{generalError}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          <Input
            id="fullName"
            label="Họ và tên"
            type="text"
            placeholder="Nhập họ và tên của bạn"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }))
            }}
            error={errors.fullName}
            disabled={isSubmitting}
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              if (generalError) setGeneralError('')
            }}
            error={errors.email}
            disabled={isSubmitting}
          />

          <Input
            id="password"
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
            }}
            error={errors.password}
            disabled={isSubmitting}
          />

          <Input
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
            }}
            error={errors.confirmPassword}
            disabled={isSubmitting}
          />

          <button type="submit" className="signup-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <div className="signup-footer">
          <span>Đã có tài khoản? </span>
          <a href="/login" onClick={handleLoginClick} className="login-link">
            Đăng nhập
          </a>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
