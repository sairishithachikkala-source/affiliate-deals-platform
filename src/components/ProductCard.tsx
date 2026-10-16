import React, { useState } from 'react';
import { Heart, ExternalLink, Star, ShieldCheck, Check } from 'lucide-react';
import { Deal } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  deal: Deal;
  onOpenDetails?: (deal: Deal) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ deal, onOpenDetails }) => {
  const { t } = useLanguage();
  const { isSaved, toggleWishlist } = useWishlist();
  const [justToggled, setJustToggled] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const saved = isSaved(deal.id);
  const savings = deal.original_price - deal.current_price;

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowSaved = await toggleWishlist(deal.id);
    if (isNowSaved) {
      setJustToggled(true);
      setTimeout(() => setJustToggled(false), 1200);
    }
  };

  const handleViewDeal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRedirecting(true);

    // Call redirect tracking API endpoint
    const redirectUrl = `/api/deals/${deal.id}/redirect`;
    
    // In background, log click and redirect to retailer
    window.open(redirectUrl, '_blank', 'noopener,noreferrer,sponsored');
    
    setTimeout(() => {
      setIsRedirecting(false);
    }, 1500);
  };

  return (
    <div
      className="deal-card"
      id={`deal-card-${deal.id}`}
      onClick={() => onOpenDetails && onOpenDetails(deal)}
      style={{ cursor: onOpenDetails ? 'pointer' : 'default' }}
    >
      {/* Image & Overlay Badges */}
      <div className="deal-card-image-wrap">
        <img
          src={deal.image_url}
          alt={deal.display_title || deal.title}
          className="deal-card-image"
          loading="lazy"
        />

        {/* Top Badges */}
        <div
          style={{
            position: 'absolute',
            top: '0.65rem',
            left: '0.65rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            alignItems: 'flex-start',
            zIndex: 10,
          }}
        >
          {deal.discount_percentage > 0 && (
            <span className="badge-discount">
              {t('discount_off', { percent: deal.discount_percentage })}
            </span>
          )}

          {deal.deal_badge && (
            <span
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              {deal.deal_badge}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          id={`wishlist-toggle-${deal.id}`}
          onClick={handleHeartClick}
          aria-label={saved ? t('removed_from_wishlist') : t('saved_to_wishlist')}
          style={{
            position: 'absolute',
            top: '0.65rem',
            right: '0.65rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: justToggled ? 'scale(1.25)' : 'scale(1)',
          }}
          title={saved ? t('saved') : t('save_deal')}
        >
          <Heart
            size={18}
            style={{
              color: saved ? '#e11d48' : '#64748b',
              fill: saved ? '#e11d48' : 'none',
              transition: 'fill 0.2s ease',
            }}
          />
        </button>

        {/* Store Retailer Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.65rem',
            left: '0.65rem',
            zIndex: 10,
          }}
        >
          <span
            className="badge-retailer"
            style={{
              backgroundColor: '#ffffff',
              borderColor: deal.retailer_badge_color || '#e2e8f0',
              color: '#0f172a',
            }}
          >
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
        </div>
      </div>

      {/* Content Details */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Rating and Verified Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              <Star size={13} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              <span>{deal.rating.toFixed(1)}</span>
            </div>
            {deal.reviews_count > 0 && (
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                ({deal.reviews_count.toLocaleString('en-IN')})
              </span>
            )}
          </div>

          <span className="badge-verified">
            <ShieldCheck size={12} />
            {t('verified_deal')}
          </span>
        </div>

        {/* Product Title */}
        <h3
          style={{
            fontSize: '0.98rem',
            fontWeight: 600,
            color: '#0f172a',
            lineHeight: 1.35,
            marginBottom: '0.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.7em',
          }}
          title={deal.display_title || deal.title}
        >
          {deal.display_title || deal.title}
        </h3>

        {/* Short Description */}
        <p
          style={{
            fontSize: '0.8rem',
            color: '#64748b',
            lineHeight: 1.4,
            marginBottom: '0.85rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {deal.display_description || deal.description}
        </p>

        {/* Price & Savings */}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px dashed #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              ₹{deal.current_price.toLocaleString('en-IN')}
            </span>

            {deal.original_price > deal.current_price && (
              <span
                style={{
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  textDecoration: 'line-through',
                }}
              >
                ₹{deal.original_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {savings > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.15rem' }}>
              {t('save_amount', { amount: savings.toLocaleString('en-IN') })}
            </div>
          )}

          {/* Action CTA: View Deal */}
          <div style={{ marginTop: '0.85rem' }}>
            <button
              type="button"
              id={`btn-view-deal-${deal.id}`}
              onClick={handleViewDeal}
              className="btn-view-deal"
              style={{ width: '100%' }}
              title={`${t('view_deal')} on ${deal.retailer_name}`}
            >
              <span>{isRedirecting ? t('affiliate_redirecting_text') : t('view_deal')}</span>
              <ExternalLink size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
