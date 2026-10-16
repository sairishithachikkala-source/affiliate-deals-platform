import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const TermsPage: React.FC = () => {
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
          {t('footer_terms')}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Last Updated: 2026 | DealNest India Platform Guidelines
        </p>

        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            1. Platform Nature (Deals Discovery Portal)
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            DealNest India is an independent deals discovery and price aggregation platform. We are NOT a merchant, retailer, seller, or payment gateway. We do not manufacture, sell, ship, or warranty any of the products shown on our site.
          </p>
        </section>

        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            2. Prices and Retailer Terms
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            Product prices, availability, delivery charges, and refund policies are determined solely by the destination retailer (Amazon, Flipkart, etc.). Any purchase you make on the retailer site is governed by their respective Terms of Sale.
          </p>
        </section>

        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            3. Demonstration Content Disclaimer
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            Promotional banners, deal claims, or sample ratings marked as demo content are for presentation and feature testing. Real verified deals are published by site administrators.
          </p>
        </section>
      </div>
    </div>
  );
};
