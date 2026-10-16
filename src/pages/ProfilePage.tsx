import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Globe, Check, AlertCircle, LogOut, Shield } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [langPreference, setLangPreference] = useState(user?.preferred_language || currentLanguage);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const res = await updateProfile({
      name,
      preferred_language: langPreference,
    });

    setSaving(false);
    if (res.success) {
      setLanguage(langPreference);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || 'Failed to update preferences');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem', maxWidth: '640px' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
        }}
        className="animate-fade-in"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {t('profile_title')}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Manage your personal settings and language preferences
            </p>
          </div>

          {user.role === 'admin' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
              }}
            >
              <Shield size={14} />
              Admin
            </span>
          )}
        </div>

        {success && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <Check size={16} />
            <span>{t('profile_updated_success')}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              {t('auth_name')}
            </label>
            <input
              type="text"
              id="profile-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              {t('auth_email')} (Read-only)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {/* Website Language Selection */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <Globe size={18} style={{ color: '#2563eb' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                {t('profile_language_heading')}
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.4 }}>
              {t('profile_language_desc')}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = langPreference === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLangPreference(lang.code)}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1d4ed8' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem' }}>{lang.nativeName}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="submit"
              id="profile-save-btn"
              disabled={saving}
              className="btn-primary"
              style={{ padding: '0.75rem 1.75rem' }}
            >
              {saving ? 'Saving...' : t('profile_save_changes')}
            </button>

            <button
              type="button"
              id="profile-logout-btn"
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              <LogOut size={16} />
              <span>{t('nav_logout')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
