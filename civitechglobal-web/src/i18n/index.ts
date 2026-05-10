import { fa } from './fa';
import { en } from './en';

export type Locale = 'fa' | 'en';

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type Translations = DeepString<typeof fa>;

export const translations: Record<Locale, Translations> = { fa, en };

export const localeConfig: Record<Locale, { dir: 'rtl' | 'ltr'; label: string; flag: string }> = {
  fa: { dir: 'rtl', label: 'فارسی', flag: '🇮🇷' },
  en: { dir: 'ltr', label: 'English', flag: '🇬🇧' },
};
