import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, Filter, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Deal, Category, Retailer } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { SortBar } from '../components/SortBar';

export const DealsPage: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeModalDeal, setActiveModalDeal] = useState<Deal | null>(null);

  // Read URL params
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedSubcategory = searchParams.get('subcategory') || '';
  const selectedRetailer = searchParams.get('retailer') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const minDiscount = searchParams.get('min_discount') || '';
  const currentSort = searchParams.get('sort') || 'featured';
  const featured = searchParams.get('featured') || '';
  const trending = searchParams.get('trending') || '';

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));

    fetch('/api/categories/retailers')
      .then((r) => r.json())
      .then((d) => setRetailers(d.retailers || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    params.set('lang', currentLanguage);

    fetch(`/api/deals?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setDeals(data.deals || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams, currentLanguage]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {/* Page Title & Search Term Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          {searchQuery
            ? t('search_results_for', { query: searchQuery })
            : featured
            ? t('featured_deals_title')
            : trending
            ? t('trending_deals_title')
            : t('nav_deals')}
        </h1>
        {searchQuery && (
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
            {t('search_subtitle')}
          </p>
        )}
      </div>

      {/* Mobile Filter Toggle Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }} className="mobile-filter-btn-wrap">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Filter size={16} />
          <span>{t('filter_title')}</span>
        </button>
      </div>

      {/* 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }} className="deals-catalog-grid">
        {/* Sidebar */}
        <div className={`filters-column ${mobileFilterOpen ? 'mobile-visible' : ''}`}>
          <FiltersSidebar
            categories={categories}
            retailers={retailers}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedRetailer={selectedRetailer}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minDiscount={minDiscount}
            onFilterChange={updateParam}
            onClearFilters={handleClearAll}
          />
        </div>

        {/* Catalog List */}
        <div>
          <SortBar
            totalCount={deals.length}
            currentSort={currentSort}
            onSortChange={(val) => updateParam('sort', val)}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              <p>{t('loading_deals', { lang: t('current_language') })}</p>
            </div>
          ) : deals.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 1.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
              }}
            >
              <ShoppingBag size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                {t('no_deals_found')}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                {t('subcategory_empty_desc')}
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="btn-primary"
              >
                {t('reset_filters')}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {deals.map((deal) => (
                <ProductCard
                  key={deal.id}
                  deal={deal}
                  onOpenDetails={(d) => setActiveModalDeal(d)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductDetailModal
        deal={activeModalDeal}
        onClose={() => setActiveModalDeal(null)}
      />

      <style>{`
        @media (max-width: 900px) {
          .deals-catalog-grid {
            grid-template-columns: 1fr !important;
          }
          .filters-column {
            display: none;
          }
          .filters-column.mobile-visible {
            display: block;
            margin-bottom: 1.5rem;
          }
        }
        @media (min-width: 901px) {
          .mobile-filter-btn-wrap {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
