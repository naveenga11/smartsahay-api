import './ErrorMessage.css';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <span className="error-icon">⚠️</span>
      <p className="error-text">{message}</p>
      {onRetry && (
        <button className="btn-retry" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}
