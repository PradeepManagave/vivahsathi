// ============================================================
// Internationalization Configuration
// ============================================================

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr' }
] as const;

export const defaultLanguage = 'en';

export type LanguageCode = (typeof languages)[number]['code'];

export const i18n = {
  defaultLocale: defaultLanguage,
  locales: languages.map((l) => l.code) as [string, ...string[]],
  localeDetection: true
} as const;

export const languageNames: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी'
};

export const languageNativeNames: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी'
};
