/**
 * ФАЙЛ: LanguageContext.jsx
 * ЧТО ЭТО: Контекст языка.
 * ЗА ЧТО ОТВЕЧАЕТ: ru, kk, en.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANG, LANGS, translations } from './translations';

const STORAGE_KEY = 'ctp_lang';

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (path) => path,
});

const getNested = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), obj);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return LANGS.includes(stored) ? stored : DEFAULT_LANG;
  });

  const setLang = (next) => {
    const normalized = LANGS.includes(next) ? next : DEFAULT_LANG;
    setLangState(normalized);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, normalized);
      window.dispatchEvent(new CustomEvent('langChanged', { detail: normalized }));
    }
  };

  useEffect(() => {
    const handler = (e) => {
      const value = e.detail;
      if (LANGS.includes(value)) {
        setLangState(value);
      }
    };
    window.addEventListener('langChanged', handler);
    return () => window.removeEventListener('langChanged', handler);
  }, []);

  const t = useMemo(
    () => (path) => {
      const fromCurrent = getNested(translations[lang] || {}, path);
      if (fromCurrent != null) return fromCurrent;
      const fromDefault = getNested(translations[DEFAULT_LANG] || {}, path);
      return fromDefault != null ? fromDefault : path;
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
    }),
    [lang, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

