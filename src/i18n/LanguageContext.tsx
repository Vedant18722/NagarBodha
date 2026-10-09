/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NagarBodha Language & Bilingual Sanskrit Context Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, TranslationKey, TRANSLATIONS, SUPPORTED_LANGUAGES } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  bilingualSanskrit: boolean;
  setBilingualSanskrit: (enabled: boolean) => void;
  t: (key: TranslationKey) => string;
  tDual: (key: TranslationKey) => { primary: string; secondary?: string };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'nagarbodha_lang';
const STORAGE_BILINGUAL_KEY = 'nagarbodha_bilingual';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY) as SupportedLanguage;
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch {
      // Ignore localStorage error in sandbox
    }
    return 'en';
  });

  const [bilingualSanskrit, setBilingualSanskritState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BILINGUAL_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Sync document lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch (e) {}
  };

  const setBilingualSanskrit = (enabled: boolean) => {
    setBilingualSanskritState(enabled);
    try {
      localStorage.setItem(STORAGE_BILINGUAL_KEY, enabled ? 'true' : 'false');
    } catch (e) {}
  };

  const t = (key: TranslationKey): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    const text = langDict[key];
    if (text) return text;
    return TRANSLATIONS.en[key] || String(key);
  };

  const tDual = (key: TranslationKey): { primary: string; secondary?: string } => {
    const primary = t(key);

    if (bilingualSanskrit) {
      // If current language is not Sanskrit, show Sanskrit as secondary
      if (language !== 'sa') {
        const sanskritText = TRANSLATIONS.sa[key];
        if (sanskritText && sanskritText !== primary) {
          return { primary, secondary: sanskritText };
        }
      } else {
        // If current language is Sanskrit, show English as secondary if helpful
        const englishText = TRANSLATIONS.en[key];
        if (englishText && englishText !== primary) {
          return { primary, secondary: englishText };
        }
      }
    }

    return { primary };
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        bilingualSanskrit,
        setBilingualSanskrit,
        t,
        tDual
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
