import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        marginTop: 'auto',
        paddingTop: '3rem',
        paddingBottom: '2rem',
      }}
    >
      <div className="container">
        {/* Top Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {/* Col 1: Brand & About */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Flame size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                DealNest<span style={{ color: '#e11d48' }}>.in</span>
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {t('footer_about_text')}
            </p>

            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                {t('select_language')}:
              </p>
              <LanguageSelector />
            </div>
          </div>

          {/* Col 2: Top Categories */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '1rem' }}>
              {t('footer_categories')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/deals?category=electronics-tech" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('category_electronics')}
                </Link>
              </li>
              <li>
                <Link to="/deals?category=fashion-accessories" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('category_fashion')}
                </Link>
              </li>
              <li>
                <Link to="/deals?category=beauty-personal-care" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('category_beauty')}
                </Link>
              </li>
              <li>
                <Link to="/deals?category=home-kitchen" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('category_home_kitchen')}
                </Link>
              </li>
              <li>
                <Link to="/deals?category=others" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('category_others')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '1rem' }}>
              {t('footer_quick_links')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/deals" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('nav_deals')}
                </Link>
              </li>
              <li>
                <Link to="/deals?trending=true" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('nav_trending')}
                </Link>
              </li>
              <li>
                <Link to="/wishlist" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('nav_wishlist')}
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('nav_login')}
                </Link>
              </li>
              <li>
                <Link to="/admin" style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
                  🛡️ {t('nav_admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Affiliate */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '1rem' }}>
              {t('footer_legal')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/affiliate-disclosure" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('footer_affiliate_disclosure')}
                </Link>
              </li>
              <li>
                <Link to="/terms" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('footer_terms')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t('footer_privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Box */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            margin: '1.5rem 0',
            fontSize: '0.78rem',
            color: '#64748b',
            lineHeight: 1.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
            <ShieldCheck size={15} style={{ color: '#059669' }} />
            <span>{t('footer_affiliate_disclosure')}</span>
          </div>
          <p>{t('footer_disclosure_text')}</p>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#94a3b8',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <p>{t('footer_copyright')}</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Designed with <Heart size={13} style={{ color: '#e11d48', fill: '#e11d48' }} /> for Indian Shoppers
          </p>
        </div>
      </div>
    </footer>
  );
};
