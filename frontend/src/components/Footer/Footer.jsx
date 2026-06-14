import './Footer.css'

function Footer({ onNavigate }) {
  const handleClick = (path, e) => {
    e.preventDefault()
    if (onNavigate) {
      onNavigate(path)
    }
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <span className="footer-logo">MinLish</span>
          <span className="footer-copyright">
            © 2026 MinLish. Modern Academic Premium Learning.
          </span>
        </div>
        <nav className="footer-right">
          <a href="/" onClick={(e) => handleClick('/', e)} className="footer-link">
            About
          </a>
          <a href="/" onClick={(e) => handleClick('/', e)} className="footer-link">
            Privacy Policy
          </a>
          <a href="/" onClick={(e) => handleClick('/', e)} className="footer-link">
            Terms of Service
          </a>
          <a href="/" onClick={(e) => handleClick('/', e)} className="footer-link">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
