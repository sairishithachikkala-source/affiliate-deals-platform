import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';

interface LanguageSelectorProps {
  isMobile?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isMobile = false }) => {
  const { currentLanguage, currentLangInfo, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (langCode: string) => {
    setLanguage(langCode, true);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} id="language-selector-wrapper">
      <button
        type="button"
        id="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="lang-selector-trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Select Website Language"
      >
        <Globe size={16} className="text-blue-600" style={{ color: '#2563eb' }} />
        <span className="font-medium text-slate-800" style={{ fontWeight: 600 }}>
          {currentLangInfo.nativeName}
        </span>
        <ChevronDown size={14} className="text-slate-500" style={{ marginLeft: 2 }} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 z-50 py-2 animate-fade-in"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.5rem',
            width: isMobile ? '240px' : '220px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            zIndex: 100,
            padding: '0.4rem 0',
          }}
          role="menu"
          aria-orientation="vertical"
        >
          <div
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '0.25rem',
            }}
          >
            Select Language / భాషను ఎంచుకోండి
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  id={`lang-option-${lang.code}`}
                  onClick={() => handleSelect(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.88rem',
                    textAlign: 'left',
                    color: isSelected ? '#1d4ed8' : '#1e293b',
                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  role="menuitem"
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.92rem' }}>{lang.nativeName}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{lang.label}</span>
                  </div>
                  {isSelected && (
                    <Check size={16} style={{ color: '#2563eb', strokeWidth: 2.5 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
