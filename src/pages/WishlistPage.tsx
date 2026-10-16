import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Deal } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';

export const WishlistPage: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();
  const { wishlistIds, items, loading, toggleWishlist, refreshWishlist } = useWishlist();
  const [activeModalDeal, setActiveModalDeal] = useState<Deal | null>(null);
  const [guestDeals, setGuestDeals] = useState<Deal[]>([]);
  const [guestLoading, setGuestLoading] = useState(false);

  // If user is guest, fetch details for their local wishlist IDs
  useEffect(() => {
    if (!user && wishlistIds.length > 0) {
      setGuestLoading(true);
      fetch(`/api/deals?lang=${currentLanguage}`)
        .then((r) => r.json())
        .then((data) => {
          const all: Deal[] = data.deals || [];
          setGuestDeals(all.filter((d) => wishlistIds.includes(d.id)));
        })
        .finally(() => setGuestLoading(false));
    }
  }, [user, wishlistIds, currentLanguage]);

  const displayedDeals: Deal[] = user ? items : guestDeals;
  const isLoading = user ? loading : guestLoading;

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Heart size={24} style={{ color: '#e11d48', fill: '#e11d48' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {t('wishlist_title')}
          </h1>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          {t('wishlist_subtitle')}
        </p>

        {!user && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '0.85rem 1.25rem',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <p style={{ fontSize: '0.85rem', color: '#1e40af' }}>
              💡 {t('wishlist_login_prompt')}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                to="/login"
                className="btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
              >
                {t('sign_in')}
              </Link>
              <Link
                to="/register"
                className="btn-secondary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
              >
                {t('create_account')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <p>{t('loading_deals', { lang: t('current_language') })}</p>
        </div>
      ) : displayedDeals.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            maxWidth: '540px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Heart size={32} style={{ color: '#e11d48' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            {t('wishlist_empty')}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {t('wishlist_empty_desc')}
          </p>
          <Link to="/deals" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            <span>{t('explore_deals_btn')}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {displayedDeals.map((deal) => (
              <ProductCard
                key={deal.id}
                deal={deal}
                onOpenDetails={(d) => setActiveModalDeal(d)}
              />
            ))}
          </div>
        </div>
      )}

      <ProductDetailModal
        deal={activeModalDeal}
        onClose={() => setActiveModalDeal(null)}
      />
    </div>
  );
};
