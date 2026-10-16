import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import en from './translations/en.json';
import te from './translations/te.json';
import hi from './translations/hi.json';
import ta from './translations/ta.json';
import ml from './translations/ml.json';
import kn from './translations/kn.json';
import mr from './translations/mr.json';
import bn from './translations/bn.json';

export interface LanguageInfo {
  code: string;
  label: string;
  nativeName: string;
  fontClass: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', nativeName: 'English', fontClass: 'font-sans' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', fontClass: 'font-telugu' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', fontClass: 'font-devanagari' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', fontClass: 'font-tamil' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', fontClass: 'font-malayalam' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', fontClass: 'font-kannada' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', fontClass: 'font-devanagari' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', fontClass: 'font-bengali' },
];

const translationsMap: Record<string, Record<string, string>> = {
  en,
  te,
  hi,
  ta,
  ml,
  kn,
  mr,
  bn,
};

interface LanguageContextType {
  currentLanguage: string;
  currentLangInfo: LanguageInfo;
  setLanguage: (langCode: string, syncWithServer?: boolean) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  supportedLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('dealnest_language');
      if (saved && translationsMap[saved]) {
        return saved;
      }
    } catch (e) {
      // ignore localstorage errors
    }
    // Default language is strictly English as required
    return 'en';
  });

  const currentLangInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    try {
      localStorage.setItem('dealnest_language', currentLanguage);
      document.documentElement.lang = currentLanguage;
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
  }, [currentLanguage]);

  const setLanguage = (langCode: string, syncWithServer = true) => {
    if (!translationsMap[langCode]) {
      console.warn(`Unsupported language code requested: ${langCode}, falling back to 'en'`);
      langCode = 'en';
    }
    setCurrentLanguageState(langCode);

    // If token exists and sync requested, save preference to user profile in DB
    if (syncWithServer) {
      const token = localStorage.getItem('dealnest_token');
      if (token) {
        fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ preferred_language: langCode }),
        }).catch((err) => console.error('Failed to sync language with profile:', err));
      }
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const currentDict = translationsMap[currentLanguage] || translationsMap.en;
    let text = currentDict[key] || translationsMap.en[key] || key;

    if (params) {
      for (const [paramKey, paramVal] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      }
    }

    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentLangInfo,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
