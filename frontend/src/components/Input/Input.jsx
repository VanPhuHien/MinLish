import './Input.css'

function Input({ label, type = 'text', placeholder, value, onChange, id, rightElement, error }) {
  return (
    <div className="input-group">
      <div className="input-label-container">
        {label && (
          <label htmlFor={id} className="input-label">
            {label}
          </label>
        )}
        {rightElement && <div className="input-right-element">{rightElement}</div>}
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`custom-input ${error ? 'input-error' : ''}`}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  )
}

export default Input

