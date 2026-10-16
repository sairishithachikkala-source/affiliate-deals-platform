import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Deal, Category, Retailer } from '../types';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryPills } from '../components/CategoryPills';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { SortBar } from '../components/SortBar';

export const HomePage: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([]);
  const [trendingDeals, setTrendingDeals] = useState<Deal[]>([]);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minDiscount, setMinDiscount] = useState('');
  const [currentSort, setCurrentSort] = useState('featured');

  // Modal State
  const [activeModalDeal, setActiveModalDeal] = useState<Deal | null>(null);

  // Load Categories & Retailers
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);

    fetch('/api/categories/retailers')
      .then((r) => r.json())
      .then((data) => setRetailers(data.retailers || []))
      .catch(console.error);
  }, []);

  // Load Deals when language or filters change
  useEffect(() => {
    setLoading(true);

    // Build query params
    const params = new URLSearchParams();
    params.set('lang', currentLanguage);
    params.set('sort', currentSort);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
    if (selectedRetailer) params.set('retailer', selectedRetailer);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (minDiscount) params.set('min_discount', minDiscount);

    fetch(`/api/deals?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const deals: Deal[] = data.deals || [];
        setAllDeals(deals);
        setFeaturedDeals(deals.filter((d) => d.is_featured).slice(0, 4));
        setTrendingDeals(deals.filter((d) => d.is_trending).slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [
    currentLanguage,
    selectedCategory,
    selectedSubcategory,
    selectedRetailer,
    minPrice,
    maxPrice,
    minDiscount,
    currentSort,
  ]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'category') setSelectedCategory(value);
    if (key === 'subcategory') setSelectedSubcategory(value);
    if (key === 'retailer') setSelectedRetailer(value);
    if (key === 'min_price') setMinPrice(value);
    if (key === 'max_price') setMaxPrice(value);
    if (key === 'min_discount') setMinDiscount(value);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedRetailer('');
    setMinPrice('');
    setMaxPrice('');
    setMinDiscount('');
    setCurrentSort('featured');
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Category Shortcut Pills */}
      <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
          {t('quick_categories_title')}
        </h2>
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={(slug) => {
            if (slug) {
              navigate(`/category/${slug}`);
            } else {
              setSelectedCategory('');
              setSelectedSubcategory('');
            }
          }}
        />
      </div>

      {/* Featured Deals Section */}
      {!selectedCategory && !selectedRetailer && featuredDeals.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={20} style={{ color: '#f59e0b' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  {t('featured_deals_title')}
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                {t('featured_deals_subtitle')}
              </p>
            </div>
            <Link
              to="/deals?featured=true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#2563eb',
              }}
            >
              <span>{t('view_all')}</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {featuredDeals.map((deal) => (
              <ProductCard
                key={deal.id}
                deal={deal}
                onOpenDetails={(d) => setActiveModalDeal(d)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending Deals Section */}
      {!selectedCategory && !selectedRetailer && trendingDeals.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={20} style={{ color: '#e11d48' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  {t('trending_deals_title')}
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                {t('trending_deals_subtitle')}
              </p>
            </div>
            <Link
              to="/deals?trending=true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#2563eb',
              }}
            >
              <span>{t('view_all')}</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {trendingDeals.map((deal) => (
              <ProductCard
                key={deal.id}
                deal={deal}
                onOpenDetails={(d) => setActiveModalDeal(d)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Top Retailers Section */}
      <section
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '1.75rem',
          marginBottom: '3rem',
        }}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            {t('top_retailers_title')}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {t('top_retailers_subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
          {retailers.map((ret) => (
            <button
              key={ret.slug}
              type="button"
              onClick={() => {
                setSelectedRetailer(selectedRetailer === ret.slug ? '' : ret.slug);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 1.15rem',
                borderRadius: '12px',
                border: selectedRetailer === ret.slug ? '2px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: selectedRetailer === ret.slug ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: ret.badge_color || '#2563eb',
                }}
              />
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                {ret.name}
              </span>
              {ret.deals_count !== undefined && (
                <span
                  style={{
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                  }}
                >
                  {t('deals_count_label', { count: ret.deals_count })}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* All Deals with Filter Sidebar */}
      <section id="all-deals-section">
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            {selectedCategory
              ? t(categories.find((c) => c.slug === selectedCategory)?.name_key || 'nav_deals')
              : t('nav_deals')}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="deals-layout-grid">
          {/* Main Deals Column */}
          <div>
            <SortBar
              totalCount={allDeals.length}
              currentSort={currentSort}
              onSortChange={setCurrentSort}
            />

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <p>{t('loading_deals', { lang: t('current_language') })}</p>
              </div>
            ) : allDeals.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 1.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                }}
              >
                <ShoppingBag size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                  {t('no_deals_found')}
                </h3>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn-primary"
                  style={{ marginTop: '0.5rem' }}
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
                {allDeals.map((deal) => (
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
      </section>

      {/* Product Detail Modal */}
      <ProductDetailModal
        deal={activeModalDeal}
        onClose={() => setActiveModalDeal(null)}
      />
    </div>
  );
};
