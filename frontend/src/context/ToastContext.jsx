import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, X, ShoppingBag } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

let _id = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ productName, imageUrl }) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, productName, imageUrl }]);
    setTimeout(() => removeToast(id), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast portal — top-right, above everything */}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.875rem 1rem',
              background: 'var(--color-primary)',
              color: '#ffffff',
              width: '320px',
              maxWidth: '90vw',
              pointerEvents: 'all',
              animation: 'toast-in 300ms cubic-bezier(0.4,0,0.2,1) both',
              borderLeft: '3px solid rgba(255,255,255,0.4)',
            }}
          >
            {/* Thumbnail */}
            <div style={{
              width: 48, height: 48, flexShrink: 0,
              backgroundColor: 'rgba(255,255,255,0.12)',
              overflow: 'hidden',
            }}>
              {t.imageUrl
                ? <img src={t.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <ShoppingBag size={24} style={{ margin: '12px', color: 'rgba(255,255,255,0.7)' }} />
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>
                Added to bag
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                {/* XSS safe: React text nodes are auto-escaped */}
                {t.productName}
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0, padding: '0.25rem' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
