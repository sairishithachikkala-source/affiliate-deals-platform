import React from 'react';
import { Smartphone, Shirt, Sparkles, Home, Layers } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface CategoryPillsProps {
  selectedCategory?: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({ selectedCategory, onSelectCategory }) => {
  const { t } = useLanguage();

  const categories = [
    { slug: '', labelKey: 'filter_all', icon: Sparkles },
    { slug: 'electronics-tech', labelKey: 'category_electronics', icon: Smartphone },
    { slug: 'fashion-accessories', labelKey: 'category_fashion', icon: Shirt },
    { slug: 'beauty-personal-care', labelKey: 'category_beauty', icon: Sparkles },
    { slug: 'home-kitchen', labelKey: 'category_home_kitchen', icon: Home },
    { slug: 'others', labelKey: 'category_others', icon: Layers },
  ];

  return (
    <div style={{ margin: '1.25rem 0' }}>
      <div
        style={{
          display: 'flex',
          gap: '0.65rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          scrollbarWidth: 'none',
        }}
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.slug;

          return (
            <button
              key={cat.slug}
              id={`cat-pill-${cat.slug || 'all'}`}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: isSelected ? '#1e293b' : '#ffffff',
                color: isSelected ? '#ffffff' : '#334155',
                border: isSelected ? '1px solid #1e293b' : '1px solid #e2e8f0',
                boxShadow: isSelected ? '0 4px 10px rgba(15, 23, 42, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} style={{ color: isSelected ? '#f59e0b' : '#64748b' }} />
              <span>{t(cat.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
