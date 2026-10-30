import React from 'react';
import { IconCheckCircle } from './Icons';

export default function Toast({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className="toast-bubble" onClick={onDismiss} style={{ cursor: 'pointer' }}>
        <IconCheckCircle size={18} style={{ color: '#A7F3D0' }} />
        <span>{message}</span>
      </div>
    </div>
  );
}

