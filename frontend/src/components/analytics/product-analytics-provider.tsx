'use client';

import React, { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type AnalyticsEvent = 'page_view' | 'signup' | 'login' | 'search' | 'interest_sent' | 'interest_accepted' | 'profile_view' | 'membership_purchased' | 'photo_uploaded' | 'vendor_inquiry' | 'share';

interface AnalyticsProps {
  mixpanelToken?: string;
  amplitudeApiKey?: string;
  enabled?: boolean;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    mixpanel?: {
      init: (token: string, config?: Record<string, any>) => void;
      track: (event: string, properties?: Record<string, any>) => void;
      identify: (id: string) => void;
      people: { set: (props: Record<string, any>) => void };
      reset: () => void;
    };
    amplitude?: {
      init: (apiKey: string, userId?: string, config?: Record<string, any>) => void;
      logEvent: (event: string, properties?: Record<string, any>) => void;
      setUserId: (userId: string) => void;
      reset: () => void;
    };
  }
}

export class AnalyticsService {
  private static mixpanelToken: string;
  private static amplitudeApiKey: string;

  static init(mixpanelToken?: string, amplitudeApiKey?: string) {
    if (mixpanelToken) this.mixpanelToken = mixpanelToken;
    if (amplitudeApiKey) this.amplitudeApiKey = amplitudeApiKey;
  }

  static track(event: AnalyticsEvent, properties?: Record<string, any>) {
    try {
      if (typeof window === 'undefined') return;
      if (this.mixpanelToken && window.mixpanel) {
        window.mixpanel.track(event, properties);
      }
      if (this.amplitudeApiKey && window.amplitude) {
        window.amplitude.logEvent(event, properties);
      }
    } catch { /* safe */ }
  }

  static identify(userId: string, traits?: Record<string, any>) {
    try {
      if (typeof window === 'undefined') return;
      if (this.mixpanelToken && window.mixpanel) {
        window.mixpanel.identify(userId);
        if (traits) window.mixpanel.people.set(traits);
      }
      if (this.amplitudeApiKey && window.amplitude) {
        window.amplitude.setUserId(userId);
      }
    } catch { /* safe */ }
  }

  static reset() {
    try {
      if (typeof window === 'undefined') return;
      window.mixpanel?.reset();
      window.amplitude?.reset();
    } catch { /* safe */ }
  }
}

export function AnalyticsProvider({ mixpanelToken, amplitudeApiKey, enabled = true, children }: AnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!enabled) return;
    AnalyticsService.init(mixpanelToken, amplitudeApiKey);

    if (mixpanelToken && typeof window !== 'undefined' && !window.mixpanel) {
      const script = document.createElement('script');
      script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
      script.async = true;
      script.onload = () => {
        window.mixpanel?.init(mixpanelToken, { track_pageview: true, persistence: 'localStorage' });
      };
      document.head.appendChild(script);
    }

    if (amplitudeApiKey && typeof window !== 'undefined' && !window.amplitude) {
      const script = document.createElement('script');
      script.src = 'https://cdn.amplitude.com/libs/analytics-browser-2.0.0-min.js.gz';
      script.async = true;
      script.onload = () => {
        window.amplitude?.init(amplitudeApiKey);
      };
      document.head.appendChild(script);
    }
  }, [enabled, mixpanelToken, amplitudeApiKey]);

  useEffect(() => {
    if (!enabled) return;
    AnalyticsService.track('page_view', {
      path: pathname,
      search: searchParams.toString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    });
  }, [pathname, searchParams, enabled]);

  return <>{children}</>;
}
