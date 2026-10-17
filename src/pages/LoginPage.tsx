import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Key, Mail, AlertCircle, Eye, EyeOff, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const { login, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      // Navigate to previous page or home
      const stateFrom = (location.state as any)?.from;
      const from = typeof stateFrom === 'string' ? stateFrom : (stateFrom?.pathname || '/');
      navigate(from);
    } else {
      setError(res.error || 'Login failed. Please verify your email and password.');
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setResetSubmitting(true);

    const res = await forgotPassword(resetEmail);
    setResetSubmitting(false);

    if (res.success) {
      setResetMessage(res.message || 'Reset token generated.');
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setResetStep('reset');
      }
    } else {
      setResetError(res.error || 'Failed to process password reset.');
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSubmitting(true);

    const res = await resetPassword(resetEmail, resetToken, newPassword);
    setResetSubmitting(false);

    if (res.success) {
      setResetMessage(t('auth_reset_success'));
      setEmail(resetEmail);
      setTimeout(() => {
        setForgotModalOpen(false);
        setResetStep('request');
        setResetMessage('');
      }, 2500);
    } else {
      setResetError(res.error || 'Failed to reset password. Please verify the reset token.');
    }
  };

  return (
    <div
      className="container"
      style={{
        padding: '3rem 1rem 5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '450px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '2.25rem 2rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
        }}
        className="animate-fade-in"
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.85rem',
              color: '#2563eb',
            }}
          >
            <LogIn size={26} />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {t('auth_login_title')}
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.5 }}>
            {t('auth_login_subtitle')}
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="login-email-input"
              style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}
            >
              {t('auth_email')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                id="login-email-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem 0.7rem 2.75rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label
                htmlFor="login-password-input"
                style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}
              >
                {t('auth_password')}
              </label>
              <button
                type="button"
                id="login-forgot-password-link"
                onClick={() => {
                  setResetEmail(email);
                  setForgotModalOpen(true);
                }}
                style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {t('auth_forgot_password')}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.7rem 2.8rem 0.7rem 2.75rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.35rem' }}>
              {t('auth_website_password_notice')}
            </p>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={submitting}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.8rem',
              fontSize: '0.95rem',
              borderRadius: '12px',
              fontWeight: 700,
            }}
          >
            {submitting ? t('auth_authenticating') : t('auth_login_button')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          <Link to="/register" id="link-to-register" style={{ color: '#2563eb', fontWeight: 600 }}>
            {t('auth_new_here')}
          </Link>
        </div>

        {/* Security & Admin link */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.76rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} style={{ color: '#059669' }} />
            <span>Secure Password Protection</span>
          </div>
          <Link to="/admin/login" style={{ color: '#b45309', fontWeight: 600 }}>
            Admin Portal Access →
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setForgotModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              width: '100%',
              maxWidth: '440px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                color: '#94a3b8',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              {t('auth_reset_password_title')}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '1.25rem' }}>
              {t('auth_reset_password_subtitle')}
            </p>

            {resetError && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                }}
              >
                {resetError}
              </div>
            )}

            {resetMessage && (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#047857',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{resetMessage}</span>
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestReset}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {t('auth_email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', fontSize: '0.92rem' }}
                >
                  {resetSubmitting ? 'Generating...' : t('auth_send_reset_token')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCompleteReset}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {t('auth_reset_token')}
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      backgroundColor: '#f8fafc',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {t('auth_new_password')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      style={{
                        width: '100%',
                        padding: '0.65rem 2.6rem 0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.8rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                      }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', fontSize: '0.92rem' }}
                >
                  {resetSubmitting ? 'Updating...' : t('auth_reset_submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default LoginPage;
