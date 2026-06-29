import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Manrope, JetBrains_Mono } from 'next/font/google';
import { dir } from 'i18next';

import { languages } from '@/lib/constants/i18n';
import { SiteConfig } from '@/lib/constants/config';
import { ToastProvider } from '@/components/ui/toast/toast-provider';
import { QueryProvider } from '@/lib/api/query-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { LanguageProvider } from '@/contexts/language-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
import { SentryProvider } from '@/components/analytics/sentry-provider';

import '@/styles/globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800']
});

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800']
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mplus.example.com'),
  title: {
    default: SiteConfig.title,
    template: `%s | ${SiteConfig.title}`,
    absolute: SiteConfig.title
  },
  description: SiteConfig.description,
  keywords: [
    'matrimony',
    'marriage',
    'wedding',
    'Indian matrimony',
    'Marathi matrimony',
    'Hindi matrimony',
    'matchmaking',
    'matrimonial site',
    'online shaadi',
    'Vivah Sathi'
  ],
  authors: [{ name: SiteConfig.name, url: SiteConfig.url }],
  creator: SiteConfig.name,
  publisher: SiteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['hi_IN', 'mr_IN'],
    title: SiteConfig.title,
    description: SiteConfig.description,
    url: SiteConfig.url,
    siteName: SiteConfig.name,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: SiteConfig.name
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: SiteConfig.title,
    description: SiteConfig.description,
    site: SiteConfig.twitterHandle,
    creator: SiteConfig.twitterHandle,
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: SiteConfig.url,
    languages: Object.fromEntries(
      languages.map((lang) => [lang.code, `${SiteConfig.url}/${lang.code}`])
    )
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png'
      }
    ]
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#570013' },
    { media: '(prefers-color-scheme: dark)', color: '#800020' }
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light dark'
};

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html
      lang={params.locale}
      dir={dir(params.locale)}
      className={`${plusJakarta.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-surface font-body antialiased">
        <SentryProvider>
          <AnalyticsProvider>
            <ThemeProvider>
              <LanguageProvider initialLocale={params.locale}>
                <QueryProvider>
                  <AuthProvider>
                    <NotificationProvider>
                      <ToastProvider>
                        {children}
                      </ToastProvider>
                    </NotificationProvider>
                  </AuthProvider>
                </QueryProvider>
              </LanguageProvider>
            </ThemeProvider>
          </AnalyticsProvider>
        </SentryProvider>
      </body>
    </html>
  );
}
