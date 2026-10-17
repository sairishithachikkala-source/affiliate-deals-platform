import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const HeroBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div
      className="hero-banner-card animate-fade-in"
      style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #eff6ff 100%)',
        border: '1px solid #fde68a',
        boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.08)',
      }}
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
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#b45309',
            marginBottom: '1rem',
            maxWidth: '100%',
          }}
        >
          <Flame size={16} style={{ color: '#e11d48', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('hero_badge')}</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
            overflowWrap: 'break-word',
          }}
        >
          {t('hero_title')}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
            color: '#475569',
            lineHeight: 1.55,
            marginBottom: '1.75rem',
            overflowWrap: 'break-word',
          }}
        >
          {t('hero_subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta-wrap" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Link
            to="/deals"
            id="hero-explore-deals-btn"
            className="btn-view-deal hero-btn"
            style={{ padding: '0.75rem 1.35rem', fontSize: '0.92rem', borderRadius: '12px' }}
          >
            <span>{t('hero_cta_deals')}</span>
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/deals?trending=true"
            id="hero-trending-btn"
            className="btn-secondary hero-btn"
            style={{ padding: '0.75rem 1.35rem', fontSize: '0.92rem', borderRadius: '12px', backgroundColor: '#ffffff' }}
          >
            <TrendingUp size={17} style={{ color: '#2563eb' }} />
            <span>{t('hero_cta_trending')}</span>
          </Link>
        </div>

        {/* Trust Badges Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(217, 119, 6, 0.15)',
            fontSize: '0.78rem',
            color: '#64748b',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={15} style={{ color: '#059669', flexShrink: 0 }} />
            <span>{t('verified_price_drops')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <span>{t('languages_supported_badge')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontWeight: 800, color: '#e11d48' }}>₹</span>
            <span>{t('zero_commission_badge')}</span>
          </div>
        </div>
      </div>

      <style>{`
        .hero-banner-card {
          padding: 2.25rem 2rem;
          margin: 1.5rem 0;
        }
        @media (max-width: 640px) {
          .hero-banner-card {
            padding: 1.5rem 1rem !important;
            margin: 1rem 0 !important;
            border-radius: 16px !important;
          }
          .hero-btn {
            width: 100% !important;
            text-align: center !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
};
export default HeroBanner;
