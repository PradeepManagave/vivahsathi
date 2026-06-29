'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  availableLanguages: { code: string; name: string; native: string }[];
}

const availableLanguages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLocale = 'en' }: { children: ReactNode; initialLocale?: string }) {
  const [locale, setLocaleState] = useState(initialLocale);
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
    const segments = (pathname ?? '').split('/').filter(Boolean);
    if (availableLanguages.some(l => l.code === segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    router.push(`/${segments.join('/')}`);
  }, [pathname, router]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
