import React, { useState } from 'react';
import { X, ExternalLink, Heart, Star, ShieldCheck, Share2, Check, Info } from 'lucide-react';
import { Deal } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductDetailModalProps {
  deal: Deal | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ deal, onClose }) => {
  const { t, currentLanguage } = useLanguage();
  const { isSaved, toggleWishlist } = useWishlist();
  const [copied, setCopied] = useState(false);

  if (!deal) return null;

  const saved = isSaved(deal.id);
  const savings = deal.original_price - deal.current_price;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `/deals?deal=${deal.slug || deal.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewDeal = () => {
    window.open(`/api/deals/${deal.id}/redirect`, '_blank', 'noopener,noreferrer,sponsored');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '780px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          id="modal-close-btn"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            zIndex: 10,
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.25rem', padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
          {/* Left Column: Image */}
          <div>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9',
                aspectRatio: '1/1',
              }}
            >
              <img
                src={deal.image_url}
                alt={deal.display_title || deal.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Quick Share & Wishlist Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => toggleWishlist(deal.id)}
                className="btn-secondary"
                style={{ flex: 1, padding: '0.6rem' }}
              >
                <Heart
                  size={18}
                  style={{
                    color: saved ? '#e11d48' : '#64748b',
                    fill: saved ? '#e11d48' : 'none',
                  }}
                />
                <span>{saved ? t('saved') : t('save_deal')}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="btn-secondary"
                style={{ padding: '0.6rem 1rem' }}
                title="Share deal"
              >
                {copied ? <Check size={18} style={{ color: '#059669' }} /> : <Share2 size={18} />}
                <span>{copied ? t('copied') : t('share_deal')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Details */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Retailer & Verification Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge-retailer" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: deal.retailer_badge_color || '#2563eb',
                    display: 'inline-block',
                  }}
                />
                {deal.retailer_name}
              </span>

              <span className="badge-verified">
                <ShieldCheck size={13} />
                {t('verified_deal')}
              </span>

              {deal.discount_percentage > 0 && (
                <span className="badge-discount" style={{ fontSize: '0.8rem' }}>
                  {t('discount_off', { percent: deal.discount_percentage })}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.75rem' }}>
              {deal.display_title || deal.title}
            </h2>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                <Star size={14} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                <span>{deal.rating.toFixed(1)}</span>
              </div>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {t('reviews_count', { count: deal.reviews_count.toLocaleString('en-IN') })}
              </span>
            </div>

            {/* Price Box */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                  ₹{deal.current_price.toLocaleString('en-IN')}
                </span>
                {deal.original_price > deal.current_price && (
                  <span style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                    ₹{deal.original_price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {savings > 0 && (
                <p style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {t('save_amount', { amount: savings.toLocaleString('en-IN') })} ({deal.discount_percentage}% discount)
                </p>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                {t('description_label')}
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                {deal.display_description || deal.description}
              </p>
            </div>

            {/* CTA: View Deal */}
            <div style={{ marginTop: 'auto' }}>
              <button
                type="button"
                id="modal-view-deal-btn"
                onClick={handleViewDeal}
                className="btn-view-deal"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
              >
                <span>{t('view_deal')} • {deal.retailer_name}</span>
                <ExternalLink size={18} />
              </button>

              {/* Affiliate Mini Transparency Note */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.4rem',
                  marginTop: '0.75rem',
                  fontSize: '0.72rem',
                  color: '#64748b',
                  lineHeight: 1.35,
                }}
              >
                <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#94a3b8' }} />
                <span>{t('affiliate_disclosure_mini')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
