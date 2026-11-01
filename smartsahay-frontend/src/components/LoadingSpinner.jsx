import './LoadingSpinner.css';

export default function LoadingSpinner({ text = 'Loading…' }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <div className="spinner" />
      <p className="spinner-text">{text}</p>
    </div>
  );
}
