import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Key, UserCheck, AlertCircle, Eye, EyeOff, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin, isAdmin, token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Admin login identifier is "Sai Krishna Chikkala"
  const [identifier, setIdentifier] = useState('Sai Krishna Chikkala');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated as administrator, navigate directly to dashboard
  useEffect(() => {
    if (token && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [token, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Admin identifier is required.');
      return;
    }

    if (!password) {
      setError('Admin password is required.');
      return;
    }

    setSubmitting(true);
    const res = await adminLogin(identifier.trim(), password);
    setSubmitting(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Authentication failed. Please check your admin credentials.');
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
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #fde68a',
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 35px -10px rgba(245, 158, 11, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        }}
        className="animate-fade-in"
      >
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '1px solid #fcd34d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#b45309',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
            }}
          >
            <ShieldCheck size={30} />
          </div>

          <span
            style={{
              display: 'inline-block',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              marginBottom: '0.5rem',
              border: '1px solid #fde68a',
            }}
          >
            Restricted Admin Area
          </span>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {t('admin_login_title')}
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.5 }}>
            {t('admin_login_subtitle')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              fontSize: '0.84rem',
              marginBottom: '1.25rem',
              lineHeight: 1.45,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Admin Identifier */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="admin-identifier-input"
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '0.4rem',
              }}
            >
              {t('admin_identifier')}
            </label>
            <div style={{ position: 'relative' }}>
              <UserCheck
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                id="admin-identifier-input"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Sai Krishna Chikkala"
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem 0.7rem 2.75rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.3rem' }}>
              Authorized administrator identifier for DealNest.in
            </p>
          </div>

          {/* Admin Password */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label
              htmlFor="admin-password-input"
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '0.4rem',
              }}
            >
              {t('admin_password')}
            </label>
            <div style={{ position: 'relative' }}>
              <Key
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter server admin password"
                style={{
                  width: '100%',
                  padding: '0.7rem 2.8rem 0.7rem 2.75rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  backgroundColor: '#ffffff',
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
            <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.3rem' }}>
              Configured via server-side environment variables
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="admin-login-submit-btn"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.8rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: '#b45309',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 10px rgba(180, 83, 9, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            <Lock size={16} />
            <span>{submitting ? 'Verifying Admin Access...' : t('admin_login_btn')}</span>
          </button>
        </form>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              color: '#2563eb',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={15} />
            <span>Switch to Standard User Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default AdminLoginPage;
