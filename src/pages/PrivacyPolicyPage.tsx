import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem', maxWidth: '800px' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem 2rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
        }}
        className="animate-fade-in"
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
          {t('footer_privacy')}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Effective Date: January 1, 2026 | Compliant with Information Technology Act, 2000 (India)
        </p>

        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            1. Information We Collect
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            DealNest India collects minimal data required to provide a personalized, multilingual deals discovery service. When you create an account, we store your name, email address, password hash, and preferred Indian language. When you save deals to your wishlist, we record your saved deal preferences.
          </p>
        </section>

        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            2. Cookies and Outbound Referral Tracking
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            When you click through to an affiliate partner (e.g. Amazon.in or Flipkart.com), the partner site may set a tracking cookie on your device to attribute any subsequent purchase to our referral link. We do not receive or process your payment details, billing addresses, or bank details.
          </p>
        </section>

        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            3. Data Protection & Security
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            We implement industry-standard cryptographic hashing (bcrypt) and token-based authentication. We never sell, rent, or distribute personal information to third-party advertisers.
          </p>
        </section>
      </div>
    </div>
  );
};
