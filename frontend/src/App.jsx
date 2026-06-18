import { useState, useEffect } from 'react'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import LoginPage from './features/auth/pages/LoginPage'
import SignupPage from './features/auth/pages/SignupPage'
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage'
import LessonListPage from './features/lessons/pages/LessonListPage'
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage'
import { useAuth } from './context/AuthContext'
import './App.css'


function App() {
  const { loading } = useAuth()
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [signupEmail, setSignupEmail] = useState('')
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-spinner"></div>
      </div>
    )
  }

  const navigate = (path, emailParam) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
    if (emailParam) {
      if (path === '/reset-password') {
        setForgotPasswordEmail(emailParam)
      } else {
        setSignupEmail(emailParam)
      }
    }
  }

  const renderContent = () => {
    switch (currentPath) {
      case '/login':
        return <LoginPage onNavigate={navigate} />
      case '/signup':
        return <SignupPage onNavigate={navigate} />
      case '/verify-email':
        return <VerifyEmailPage email={signupEmail} onNavigate={navigate} />
      case '/lessons':
        return <LessonListPage onNavigate={navigate} />
      case '/forgot-password':
        return <ForgotPasswordPage onNavigate={navigate} />
      case '/reset-password':
        return <ResetPasswordPage email={forgotPasswordEmail} onNavigate={navigate} />
      default:
        return (
          <main className="main-content">
            {/* Hero Section */}
            <section className="section hero-section">
              <div className="hero-content">
                <div className="hero-badge">
                  <svg className="hero-badge-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                  </svg>
                  <span>Phương pháp học mới</span>
                </div>
                <h1 className="hero-title">
                  MinLish - Học tiếng Anh hiệu quả qua Dictation & Shadowing
                </h1>
                <p className="hero-desc">
                  Nền tảng học tập hiện đại dành cho người trẻ. Cải thiện kỹ năng nghe và nói một cách tự nhiên thông qua các phương pháp đã được kiểm chứng, trong một không gian tối giản và tập trung.
                </p>
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/login')
                  }}
                  className="btn-primary"
                >
                  <span>Bắt đầu học ngay</span>
                  <svg className="btn-icon" viewBox="0 0 24 24">
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </a>
              </div>
              <div className="hero-image-container">
                <img src="/hero.jpg" alt="MinLish Hero" className="hero-image" />
              </div>
            </section>

            {/* Features Section */}
            <section className="section features-section">
              <h2 className="section-title">Công cụ thiết yếu cho sự trôi chảy</h2>
              <p className="section-subtitle">Ba trụ cột chính giúp bạn làm chủ ngôn ngữ.</p>
              <div className="features-grid">
                {/* Dictation Card */}
                <div className="feature-card">
                  <div className="feature-icon-wrapper icon-blue">
                    <svg className="feature-icon" viewBox="0 0 24 24">
                      <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9z" />
                    </svg>
                  </div>
                  <h3 className="feature-title">Dictation</h3>
                  <p className="feature-desc">
                    Luyện nghe chép chính tả với các đoạn hội thoại thực tế. Cải thiện khả năng nhận diện âm thanh và vốn từ vựng của bạn.
                  </p>
                </div>

                {/* Shadowing Card */}
                <div className="feature-card">
                  <div className="feature-icon-wrapper icon-red">
                    <svg className="feature-icon" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.42 2.72 6.2 6 6.72V21h2v-3.28c3.28-.48 6-3.26 6-6.72h-1.7z" />
                    </svg>
                  </div>
                  <h3 className="feature-title">Shadowing</h3>
                  <p className="feature-desc">
                    Bắt chước ngữ điệu và phát âm của người bản xứ. Phương pháp hoàn hảo để có một giọng điệu tự nhiên và tự tin.
                  </p>
                </div>

                {/* Flashcards Card */}
                <div className="feature-card">
                  <div className="feature-icon-wrapper icon-blue">
                    <svg className="feature-icon" viewBox="0 0 24 24">
                      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
                    </svg>
                  </div>
                  <h3 className="feature-title">Flashcards</h3>
                  <p className="feature-desc">
                    Ghi nhớ từ vựng lâu dài thông qua hệ thống lặp lại ngắt quãng (Spaced Repetition).
                  </p>
                </div>
              </div>
            </section>

            {/* Why Choose Section */}
            <section className="section why-section">
              <div className="why-image-container">
                <img src="/why-choose.jpg" alt="Why choose MinLish" className="why-image" />
              </div>
              <div className="why-content">
                <h2 className="why-title">Tại sao chọn MinLish?</h2>
                <p className="why-desc">
                  Được thiết kế dựa trên các nguyên lý nhận thức học thuật, MinLish mang đến một trải nghiệm học tập cao cấp, không xao nhãng.
                </p>
                <div className="why-list">
                  <div className="why-item">
                    <div className="why-item-icon-wrapper icon-red">
                      <svg className="feature-icon" viewBox="0 0 24 24">
                        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-1.3l-.85-.6C7.8 13.1 7 11.5 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.5-1.1 4.1-2.15 5.1z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="why-item-title">Phương pháp học thông minh</h3>
                      <p className="why-item-desc">
                        Tập trung vào chất lượng hơn số lượng. Hệ thống tự động phân tích điểm yếu và đề xuất bài tập phù hợp.
                      </p>
                    </div>
                  </div>

                  <div className="why-item">
                    <div className="why-item-icon-wrapper icon-blue">
                      <svg className="feature-icon" viewBox="0 0 24 24">
                        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="why-item-title">Tiến bộ rõ ràng</h3>
                      <p className="why-item-desc">
                        Theo dõi sự tiến bộ hàng ngày thông qua các biểu đồ trực quan, giúp bạn luôn giữ được động lực.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
              <h2 className="cta-title">Sẵn sàng nâng tầm tiếng Anh của bạn?</h2>
              <p className="cta-desc">
                Tham gia cùng hàng ngàn học viên khác đang cải thiện kỹ năng mỗi ngày với nền tảng học tập cao cấp của chúng tôi.
              </p>
            </section>
          </main>
        )
    }
  }

  return (
    <>
      <Header onNavigate={navigate} />
      {renderContent()}
      <Footer onNavigate={navigate} />
    </>
  )
}

export default App