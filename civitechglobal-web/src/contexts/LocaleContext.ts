import { createContext } from "react";
import { translations, type Locale, type Translations } from "../i18n";

interface LocaleContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  dir: "rtl" | "ltr";
  isRtl: boolean;
}

export const LocaleContext = createContext<LocaleContextType>({
  locale: "fa",
  t: translations.fa,
  setLocale: () => {},
  dir: "rtl",
  isRtl: true,
});
