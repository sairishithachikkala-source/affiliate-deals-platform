import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, X, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface WishlistAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WishlistAuthModal: React.FC<WishlistAuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleRegister = () => {
    onClose();
    navigate('/register', { state: { from: location.pathname } });
  };

  return (
    <div
      id="wishlist-auth-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        id="wishlist-auth-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '2.25rem 2rem',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          textAlign: 'center',
          animation: 'fadeInScale 0.25s ease-out',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          id="wishlist-auth-modal-close"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.35rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.color = '#334155';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <X size={20} />
        </button>

        {/* Heart Icon Badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ffe4e6',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 16px -4px rgba(225, 29, 72, 0.2)',
          }}
        >
          <Heart size={32} style={{ fill: '#e11d48' }} />
        </div>

        {/* Title */}
        <h2
          id="wishlist-auth-modal-title"
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.65rem',
            letterSpacing: '-0.01em',
          }}
        >
          {t('wishlist_login_prompt_title')}
        </h2>

        {/* Friendly explanation */}
        <p
          id="wishlist-auth-modal-desc"
          style={{
            fontSize: '0.95rem',
            color: '#475569',
            lineHeight: 1.55,
            marginBottom: '1.75rem',
          }}
        >
          {t('wishlist_login_prompt')}
        </p>

        {/* Actions Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Action 1: Sign In */}
          <button
            type="button"
            id="wishlist-modal-signin-btn"
            onClick={handleSignIn}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem 1.25rem',
              fontSize: '0.92rem',
              fontWeight: 700,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <LogIn size={18} />
            <span>{t('sign_in')}</span>
          </button>

          {/* Action 2: Create Account */}
          <button
            type="button"
            id="wishlist-modal-register-btn"
            onClick={handleRegister}
            className="btn-secondary"
            style={{
              width: '100%',
              padding: '0.75rem 1.25rem',
              fontSize: '0.92rem',
              fontWeight: 700,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <UserPlus size={18} />
            <span>{t('create_account')}</span>
          </button>
        </div>

        {/* Secondary dismiss */}
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
          }}
        >
          {t('continue_browsing')}
        </button>
      </div>
    </div>
  );
};
