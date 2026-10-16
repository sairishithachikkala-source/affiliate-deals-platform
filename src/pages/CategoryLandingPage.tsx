import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight,
  ShoppingBag, 
  Sparkles, 
  Layers, 
  Utensils, 
  Home, 
  Shirt, 
  Smartphone, 
  Sparkle, 
  BookOpen, 
  Filter,
  Grid,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Deal, Category, Subcategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { SortBar } from '../components/SortBar';

const categoryFallbackImages: Record<string, string> = {
  'fashion-accessories': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
  'electronics-tech': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
  'beauty-personal-care': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
  'home-kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
  'others': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
};

// Helper to render relevant category/subcategory icon
const getSubcategoryIcon = (slug: string, iconName?: string) => {
  if (slug.includes('kitchen') || slug.includes('cookware') || slug.includes('utensils')) {
    return <Utensils size={28} className="text-amber-500" />;
  }
  if (slug.includes('decor') || slug.includes('furnishing') || slug.includes('furniture') || slug.includes('lighting') || slug.includes('cleaning')) {
    return <Home size={28} className="text-emerald-500" />;
  }
  if (slug.includes('fashion') || slug.includes('footwear') || slug.includes('bags') || slug.includes('watches')) {
    return <Shirt size={28} className="text-rose-500" />;
  }
  if (slug.includes('phone') || slug.includes('laptop') || slug.includes('audio') || slug.includes('watch') || slug.includes('electronics')) {
    return <Smartphone size={28} className="text-blue-500" />;
  }
  if (slug.includes('skin') || slug.includes('hair') || slug.includes('makeup') || slug.includes('grooming')) {
    return <Sparkle size={28} className="text-purple-500" />;
  }
  return <BookOpen size={28} className="text-amber-600" />;
};

export const CategoryLandingPage: React.FC = () => {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug?: string }>();
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [currentSort, setCurrentSort] = useState('featured');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeModalDeal, setActiveModalDeal] = useState<Deal | null>(null);

  // 1. Fetch category and its subcategories
  useEffect(() => {
    if (!categorySlug) return;
    setLoading(true);

    fetch(`/api/categories/${categorySlug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Category not found');
        return r.json();
      })
      .then((data) => {
        const cat = data.category;
        setCategory(cat);
        setSubcategories(cat.subcategories || []);

        if (subcategorySlug && cat.subcategories) {
          const match = cat.subcategories.find((s: Subcategory) => s.slug === subcategorySlug);
          setSelectedSubcategory(match || null);
        } else {
          setSelectedSubcategory(null);
        }
      })
      .catch((err) => {
        console.error('Error loading category:', err);
      })
      .finally(() => setLoading(false));
  }, [categorySlug, subcategorySlug]);

  // 2. Fetch deals if a subcategory is selected
  useEffect(() => {
    if (!categorySlug || !subcategorySlug) {
      setDeals([]);
      return;
    }

    setDealsLoading(true);
    const params = new URLSearchParams();
    params.set('lang', currentLanguage);
    params.set('category', categorySlug);
    params.set('subcategory', subcategorySlug);
    params.set('sort', currentSort);
    if (searchFilter.trim()) {
      params.set('search', searchFilter.trim());
    }

    fetch(`/api/deals?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setDeals(data.deals || []);
      })
      .catch((err) => {
        console.error('Error fetching deals:', err);
      })
      .finally(() => setDealsLoading(false));
  }, [categorySlug, subcategorySlug, currentLanguage, currentSort, searchFilter]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748b' }}>
        <p>{t('loading_deals', { lang: t('current_language') })}</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          {t('no_deals_found')}
        </h2>
        <Link to="/deals" className="btn-primary">
          {t('explore_deals_btn')}
        </Link>
      </div>
    );
  }

  const categoryTitle = t(category.name_key) || category.default_name;
  const subcategoryTitle = selectedSubcategory 
    ? (t(selectedSubcategory.name_key) || selectedSubcategory.default_name)
    : '';

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 4rem' }}>
      {/* Breadcrumbs Navigation */}
      <nav 
        aria-label="Breadcrumbs"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          color: '#64748b',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          {t('breadcrumbs_home')}
        </Link>
        <ChevronRight size={14} style={{ color: '#94a3b8' }} />

        {selectedSubcategory ? (
          <>
            <Link 
              to={`/category/${category.slug}`} 
              style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
            >
              {categoryTitle}
            </Link>
            <ChevronRight size={14} style={{ color: '#94a3b8' }} />
            <span style={{ color: '#0f172a', fontWeight: 700 }}>
              {subcategoryTitle}
            </span>
          </>
        ) : (
          <span style={{ color: '#0f172a', fontWeight: 700 }}>
            {categoryTitle}
          </span>
        )}
      </nav>

      {/* Case 1: Subcategory is selected -> Show Products belonging specifically to this subcategory */}
      {selectedSubcategory ? (
        <div>
          {/* Header & Back Link */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Link
              to={`/category/${category.slug}`}
              id="back-to-category-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#2563eb',
                marginBottom: '0.75rem',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} />
              <span>{t('back_to_parent_category', { category: categoryTitle })}</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
                  {subcategoryTitle}
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {selectedSubcategory.description || t('subcat_deals_subtitle', { category: categoryTitle, subcategory: subcategoryTitle })}
                </p>
              </div>

              {/* Quick Search inside this subcategory */}
              <div style={{ minWidth: '240px', maxWidth: '320px', width: '100%' }}>
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sort bar & Results count */}
          <SortBar
            totalCount={deals.length}
            currentSort={currentSort}
            onSortChange={setCurrentSort}
          />

          {/* Deals Grid or Empty State */}
          {dealsLoading ? (
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
                borderRadius: '20px',
                maxWidth: '560px',
                margin: '2rem auto',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
            >
              <ShoppingBag size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                {t('subcategory_empty_title')}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {t('subcategory_empty_desc')}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to={`/category/${category.slug}`} className="btn-secondary" style={{ padding: '0.65rem 1.25rem' }}>
                  {t('explore_subcategories')}
                </Link>
                <Link to="/deals" className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
                  {t('explore_deals_btn')}
                </Link>
              </div>
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
      ) : (
        /* Case 2: Landing Page -> Emphasize Subcategories Cards First */
        <div>
          {/* Category Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
              border: '1px solid #dbeafe',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              marginBottom: '2.5rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.06)',
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#ffffff',
                  color: '#2563eb',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  border: '1px solid #bfdbfe',
                }}
              >
                <Sparkles size={14} />
                <span>{categoryTitle}</span>
              </span>

              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                {categoryTitle}
              </h1>

              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {category.description || t('category_deals_subtitle')}
              </p>

              <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>
                👉 {t('browse_subcategories_first')}
              </p>
            </div>
          </div>

          {/* Section Heading */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                {t('explore_subcategories')}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                {categoryTitle} • {subcategories.length} {t('filter_subcategory')}
              </p>
            </div>

            <Link
              to={`/deals?category=${category.slug}`}
              id="view-all-category-deals-btn"
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
            >
              <span>{t('view_all_category_deals', { category: categoryTitle })}</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Subcategories Grid - Interactive Image Cards (Requirement 1) */}
          <div className="subcat-grid">
            {subcategories.map((subcat) => {
              const subcatTitle = t(subcat.name_key) || subcat.default_name;
              const dealsCount = subcat.deals_count || 0;
              const fallbackUrl = categoryFallbackImages[category.slug] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80';

              return (
                <div
                  key={subcat.id}
                  id={`subcat-card-${subcat.slug}`}
                  className="subcat-card"
                  onClick={() => navigate(`/category/${category.slug}/${subcat.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/category/${category.slug}/${subcat.slug}`);
                    }
                  }}
                >
                  {/* High-quality subcategory image with smooth zoom on hover */}
                  <div className="subcat-card-image-wrap">
                    <img
                      src={subcat.image_url || fallbackUrl}
                      alt={subcatTitle}
                      className="subcat-card-image"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallbackApplied) {
                          target.dataset.fallbackApplied = 'true';
                          target.src = fallbackUrl;
                        }
                      }}
                    />

                    {/* Deal count badge overlay */}
                    {dealsCount > 0 && (
                      <span className="subcat-card-badge">
                        {t('deals_count_label', { count: dealsCount })}
                      </span>
                    )}
                  </div>

                  {/* Subcategory details and explore label with arrow */}
                  <div className="subcat-card-content">
                    <h3 className="subcat-card-title">
                      {subcatTitle}
                    </h3>

                    <p className="subcat-card-desc">
                      {subcat.description || t('browse_subcategories_first')}
                    </p>

                    <div className="subcat-card-cta">
                      <span>{t('explore_label')}</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        deal={activeModalDeal}
        onClose={() => setActiveModalDeal(null)}
      />
    </div>
  );
};
