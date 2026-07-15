import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const WelcomePopup = ({ show, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setTimeout(() => setVisible(true), 100);
    } else {
      setVisible(false);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          transform: visible ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.3s ease'
        }}
      >
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          🇮🇩
        </div>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          marginBottom: '0.5rem',
          lineHeight: 1.4
        }}>
          Negeri Indonesia bak Surgawi
        </h2>
        <p style={{
          fontSize: '1rem',
          color: 'var(--primary)',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          Gemah Ripah Loh Jinawi
        </p>
        <button
          onClick={onClose}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 2rem',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default WelcomePopup;
