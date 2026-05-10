import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { translations, localeConfig, type Locale, type Translations } from '../i18n';

interface LocaleContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  dir: 'rtl' | 'ltr';
  isRtl: boolean;
}

export const LocaleContext = createContext<LocaleContextType>({
  locale: 'fa',
  t: translations.fa,
  setLocale: () => {},
  dir: 'rtl',
  isRtl: true,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locale') as Locale;
      if (saved && translations[saved]) return saved;
    }
    return 'fa';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  }, []);

  useEffect(() => {
    const config = localeConfig[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = config.dir;
    document.title = locale === 'fa' ? 'رایان تمدن جهان گستر' : 'CiviTech Global';

    // Update font based on locale
    if (locale === 'fa') {
      document.documentElement.style.fontFamily = "'Vazir', 'Tahoma', 'Arial', ui-sans-serif, system-ui, sans-serif";
    } else {
      document.documentElement.style.fontFamily = "'Inter', ui-sans-serif, system-ui, sans-serif";
    }
  }, [locale]);

  const config = localeConfig[locale];

  return (
    <LocaleContext.Provider value={{
      locale,
      t: translations[locale],
      setLocale,
      dir: config.dir,
      isRtl: config.dir === 'rtl',
    }}>
      {children}
    </LocaleContext.Provider>
  );
}
