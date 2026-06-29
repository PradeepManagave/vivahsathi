export const defaultLocale = 'en';
export const locales = ['en', 'hi', 'mr'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी'
};

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return 'ltr';
}
