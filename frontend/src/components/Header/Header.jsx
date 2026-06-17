import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

function Header({ onNavigate }) {
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleClick = (path, e) => {
    e.preventDefault()
    if (onNavigate) {
      onNavigate(path)
    }
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev)
  }

  const handleLogout = async (e) => {
    e.preventDefault()
    setIsDropdownOpen(false)
    await logout()
    if (onNavigate) {
      onNavigate('/login')
    }
  }

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Lấy chữ cái đầu của tên để làm avatar mặc định
  const getInitials = (name) => {
    if (!name) return 'U'
    return name.trim().charAt(0).toUpperCase()
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <a href="/" onClick={(e) => handleClick('/', e)} className="header-logo">
            MinLish
          </a>
          <nav className="header-nav">
            <a href="/lessons" onClick={(e) => handleClick('/lessons', e)} className="header-nav-link">
              Bài học
            </a>
            <a href="/" onClick={(e) => handleClick('/', e)} className="header-nav-link">
              Từ vựng
            </a>
          </nav>
        </div>
        <div className="header-right">
          {user ? (
            <div className="header-user-menu" ref={dropdownRef}>
              <button onClick={toggleDropdown} className="header-user-btn">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="header-avatar" />
                ) : (
                  <div className="header-avatar-placeholder">
                    {getInitials(user.name)}
                  </div>
                )}
                <span className="header-username">{user.name}</span>
                <svg
                  className={`header-chevron ${isDropdownOpen ? 'rotated' : ''}`}
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                >
                  <path
                    d="M7 10l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="header-dropdown">
                  <a
                    href="/profile"
                    onClick={(e) => handleClick('/profile', e)}
                    className="dropdown-item"
                  >
                    <svg className="dropdown-icon" viewBox="0 0 24 24" width="16" height="16">
                      <path
                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>Thông tin cá nhân</span>
                  </a>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <svg className="dropdown-icon" viewBox="0 0 24 24" width="16" height="16">
                      <path
                        d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="/login" onClick={(e) => handleClick('/login', e)} className="header-btn-login">
              Đăng nhập
            </a>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
