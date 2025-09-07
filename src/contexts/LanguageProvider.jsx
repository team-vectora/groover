'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedLang = localStorage.getItem('lang') || 'en';
    setLanguage(savedLang);

    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang);
  };

  if (!mounted) return null;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
