import { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, onClose, duration = 2800 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast__icon" aria-hidden>✓</span>
      <span className="toast__text">{message}</span>
      <button type="button" className="toast__close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}
