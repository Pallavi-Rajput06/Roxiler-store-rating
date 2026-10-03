import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        gap: '1rem',
        color: 'var(--color-text-muted)'
      }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontWeight: 500 }}>{message}</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
      <span>{message}</span>
    </div>
  );
};

export default Loader;
