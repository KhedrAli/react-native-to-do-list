import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import ar from '../i18n/ar.json';
import en from '../i18n/en.json';
import { loadLanguagePreference, saveLanguagePreference } from '../utils/storage';

export type SupportedLang = 'ar' | 'en';
export type TranslationKey = keyof typeof ar;

interface LanguageContextValue {
  lang: SupportedLang;
  isRTL: boolean;
  t: (key: TranslationKey) => string;
  setLanguage: (nextLang: SupportedLang) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'ar',
  isRTL: true,
  t: (key) => ar[key],
  setLanguage: async () => {},
});

function applyLayoutDirection(nextLang: SupportedLang) {
  const shouldBeRTL = nextLang === 'ar';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<SupportedLang>('ar');

  useEffect(() => {
    loadLanguagePreference().then((saved) => {
      setLang(saved);
      applyLayoutDirection(saved);
    });
  }, []);

  const setLanguage = async (nextLang: SupportedLang) => {
    setLang(nextLang);
    await saveLanguagePreference(nextLang);
    applyLayoutDirection(nextLang);
  };

  const dict = lang === 'ar' ? ar : en;
  const t = (key: TranslationKey) => dict[key] ?? key;

  return (
    <LanguageContext.Provider
      value={{
        lang,
        isRTL: lang === 'ar',
        t,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);