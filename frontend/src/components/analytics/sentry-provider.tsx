'use client';

import { useEffect, ReactNode } from 'react';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function SentryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!SENTRY_DSN) return;

    const initSentry = async () => {
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.init({
          dsn: SENTRY_DSN,
          environment: process.env.NODE_ENV,
          tracesSampleRate: 0.2,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
          integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
          ],
        });
      } catch {
        console.warn('Sentry failed to initialize');
      }
    };
    initSentry();
  }, []);

  return <>{children}</>;
}
