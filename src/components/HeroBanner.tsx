import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const HeroBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #eff6ff 100%)',
        border: '1px solid #fde68a',
        padding: '2.5rem 2rem',
        margin: '1.5rem 0',
        boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.08)',
      }}
      className="animate-fade-in"
    >
      <div style={{ maxWidth: '680px' }}>
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#ffffff',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #fcd34d',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#b45309',
            marginBottom: '1rem',
          }}
        >
          <Flame size={16} style={{ color: '#e11d48' }} />
          <span>{t('hero_badge')}</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}
        >
          {t('hero_title')}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            color: '#475569',
            lineHeight: 1.5,
            marginBottom: '1.75rem',
          }}
        >
          {t('hero_subtitle')}
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Link
            to="/deals"
            id="hero-explore-deals-btn"
            className="btn-view-deal"
            style={{ padding: '0.8rem 1.4rem', fontSize: '0.95rem', borderRadius: '12px' }}
          >
            <span>{t('hero_cta_deals')}</span>
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/deals?trending=true"
            id="hero-trending-btn"
            className="btn-secondary"
            style={{ padding: '0.8rem 1.4rem', fontSize: '0.95rem', borderRadius: '12px', backgroundColor: '#ffffff' }}
          >
            <TrendingUp size={18} style={{ color: '#2563eb' }} />
            <span>{t('hero_cta_trending')}</span>
          </Link>
        </div>

        {/* Trust Badges Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(217, 119, 6, 0.15)',
            fontSize: '0.8rem',
            color: '#64748b',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={16} style={{ color: '#059669' }} />
            <span>{t('verified_price_drops')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={16} style={{ color: '#f59e0b' }} />
            <span>{t('languages_supported_badge')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontWeight: 700, color: '#e11d48' }}>₹</span>
            <span>{t('zero_commission_badge')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
