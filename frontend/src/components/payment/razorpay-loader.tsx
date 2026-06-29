'use client';

import { useEffect, useState } from 'react';

interface RazorpayLoaderProps {
  children: React.ReactNode;
}

export function RazorpayLoader({ children }: RazorpayLoaderProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay SDK');
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return <>{children}</>;
}

export function useRazorpay() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  return { ready };
}
