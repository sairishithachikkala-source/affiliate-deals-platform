import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Category, Retailer } from '../types';

interface FiltersSidebarProps {
  categories: Category[];
  retailers: Retailer[];
  selectedCategory: string;
  selectedSubcategory: string;
  selectedRetailer: string;
  minPrice: string;
  maxPrice: string;
  minDiscount: string;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  categories,
  retailers,
  selectedCategory,
  selectedSubcategory,
  selectedRetailer,
  minPrice,
  maxPrice,
  minDiscount,
  onFilterChange,
  onClearFilters,
}) => {
  const { t } = useLanguage();

  const activeCategoryObj = categories.find(
    (c) =>
      c.slug === selectedCategory ||
      (c.slug === 'others' && (selectedCategory === 'other' || selectedCategory === 'lifestyle')) ||
      (c.slug === 'electronics-tech' && selectedCategory === 'electronics') ||
      (c.slug === 'fashion-accessories' && selectedCategory === 'fashion') ||
      (c.slug === 'beauty-personal-care' && selectedCategory === 'beauty') ||
      (c.slug === 'home-kitchen' && (selectedCategory === 'home' || selectedCategory === 'kitchen'))
  );
  const subcategories = activeCategoryObj?.subcategories || [];

  const priceRanges = [
    { label: t('filter_all'), min: '', max: '' },
    { label: 'Under ₹1,000', min: '0', max: '1000' },
    { label: '₹1,000 - ₹5,000', min: '1000', max: '5000' },
    { label: '₹5,000 - ₹20,000', min: '5000', max: '20000' },
    { label: 'Above ₹20,000', min: '20000', max: '' },
  ];

  const discountTiers = [
    { label: t('filter_all'), value: '' },
    { label: '20%+ OFF', value: '20' },
    { label: '40%+ OFF', value: '40' },
    { label: '60%+ OFF', value: '60' },
  ];

  const hasActiveFilters = Boolean(
    selectedCategory ||
      selectedSubcategory ||
      selectedRetailer ||
      minPrice ||
      maxPrice ||
      minDiscount
  );

  return (
    <aside
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Filter size={18} style={{ color: '#2563eb' }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
            {t('filter_title')}
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            id="clear-filters-btn"
            onClick={onClearFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.78rem',
              color: '#dc2626',
              fontWeight: 600,
            }}
          >
            <RotateCcw size={13} />
            <span>{t('filter_clear')}</span>
          </button>
        )}
      </div>

      {/* Main Category */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
          {t('filter_category')}
        </label>
        <select
          id="filter-category-select"
          value={activeCategoryObj ? activeCategoryObj.slug : selectedCategory}
          onChange={(e) => {
            onFilterChange('category', e.target.value);
            onFilterChange('subcategory', ''); // reset subcategory on category change
          }}
          style={{
            width: '100%',
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            fontSize: '0.85rem',
            color: '#1e293b',
          }}
        >
          <option value="">{t('filter_all')}</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {t(cat.name_key) || cat.default_name} {cat.deals_count ? `(${cat.deals_count})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory (shows if active category has subcategories) */}
      {subcategories.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
            {t('filter_subcategory')}
          </label>
          <select
            id="filter-subcategory-select"
            value={selectedSubcategory}
            onChange={(e) => onFilterChange('subcategory', e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '0.85rem',
              color: '#1e293b',
            }}
          >
            <option value="">{t('filter_all')}</option>
            {subcategories.map((sub) => (
              <option key={sub.slug} value={sub.slug}>
                {t(sub.name_key) || sub.default_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Retailer */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
          {t('filter_retailer')}
        </label>
        <select
          id="filter-retailer-select"
          value={selectedRetailer}
          onChange={(e) => onFilterChange('retailer', e.target.value)}
          style={{
            width: '100%',
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            fontSize: '0.85rem',
            color: '#1e293b',
          }}
        >
          <option value="">{t('filter_all')}</option>
          {retailers.map((ret) => (
            <option key={ret.slug} value={ret.slug}>
              {ret.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
          {t('filter_price_range')}
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {priceRanges.map((range, idx) => {
            const isMatch = minPrice === range.min && maxPrice === range.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onFilterChange('min_price', range.min);
                  onFilterChange('max_price', range.max);
                }}
                style={{
                  textAlign: 'left',
                  padding: '0.4rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: isMatch ? 700 : 500,
                  color: isMatch ? '#1d4ed8' : '#334155',
                  backgroundColor: isMatch ? '#eff6ff' : 'transparent',
                }}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Discount */}
      <div style={{ marginBottom: '0.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
          {t('filter_min_discount')}
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {discountTiers.map((tier, idx) => {
            const isMatch = minDiscount === tier.value;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onFilterChange('min_discount', tier.value)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: isMatch ? 700 : 500,
                  color: isMatch ? '#ffffff' : '#334155',
                  backgroundColor: isMatch ? '#dc2626' : '#f1f5f9',
                  border: '1px solid',
                  borderColor: isMatch ? '#dc2626' : '#e2e8f0',
                }}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
