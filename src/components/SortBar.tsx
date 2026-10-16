import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface SortBarProps {
  totalCount: number;
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export const SortBar: React.FC<SortBarProps> = ({ totalCount, currentSort, onSortChange }) => {
  const { t } = useLanguage();

  const sortOptions = [
    { value: 'featured', labelKey: 'sort_featured' },
    { value: 'discount', labelKey: 'sort_discount' },
    { value: 'price_low', labelKey: 'sort_price_low' },
    { value: 'price_high', labelKey: 'sort_price_high' },
    { value: 'rating', labelKey: 'sort_rating' },
    { value: 'newest', labelKey: 'sort_newest' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 0',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
        {t('results_found', { count: totalCount })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowUpDown size={15} style={{ color: '#64748b' }} />
        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {t('sort_by')}:
        </span>
        <select
          id="deals-sort-select"
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            fontSize: '0.85rem',
            color: '#0f172a',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
