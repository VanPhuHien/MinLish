import './ConfirmModal.css'

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDanger = false
}) {
  if (!isOpen) return null

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3 className="confirm-modal-title">{title}</h3>
          <button className="confirm-modal-close-btn" onClick={onCancel} aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="confirm-modal-body">
          <p className="confirm-modal-message">{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="confirm-modal-btn btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`confirm-modal-btn btn-confirm ${isDanger ? 'confirm-danger' : ''}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
