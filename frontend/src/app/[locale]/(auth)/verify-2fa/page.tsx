'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Shield, Smartphone, Copy, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store';
import { apiClient, API_ENDPOINTS } from '@/lib/api';

export default function Verify2FAPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [secret, setSecret] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    const fetch2FASetup = async () => {
      try {
        const response = await apiClient.get(`${API_ENDPOINTS.users.me}/2fa/setup`);
        const data = response.data as { data?: { secret: string; qrCode: string } };
        if (data?.data) {
          setSecret(data.data.secret);
          setQrCodeUrl(data.data.qrCode);
        }
      } catch {
        setError('Failed to load 2FA setup. Please try again.');
      }
    };
    fetch2FASetup();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.post(`${API_ENDPOINTS.users.me}/2fa/verify`, { token: otp });
      setIsVerified(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary to-primary-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
      
      <Card className="w-full max-w-md relative z-10 p-8 bg-white/95 backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-headline">Two-Factor Authentication</h1>
          <p className="text-stone-500 mt-2">
            {isVerified ? 'Verification successful!' : 'Secure your account with an authenticator app'}
          </p>
        </div>

        {isVerified ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <p className="text-lg font-semibold text-stone-900">You&apos;re all set!</p>
            <p className="text-stone-500 mt-2">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            {qrCodeUrl && !showManualEntry ? (
              <div className="text-center mb-6">
                <div className="bg-white p-4 rounded-xl inline-block border-2 border-stone-200">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="text-sm text-stone-500 mt-3">
                  Scan this QR code with your authenticator app
                </p>
                <button
                  type="button"
                  onClick={() => setShowManualEntry(true)}
                  className="text-sm text-primary hover:underline mt-2"
                >
                  Enter code manually instead
                </button>
              </div>
            ) : showManualEntry ? (
              <div className="mb-6 p-4 bg-stone-50 rounded-xl">
                <p className="text-sm font-medium text-stone-700 mb-2">Manual entry code:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded-lg font-mono text-sm border border-stone-200">
                    {secret || 'Loading...'}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!secret}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualEntry(false)}
                  className="text-sm text-primary hover:underline mt-3"
                >
                  Back to QR code
                </button>
              </div>
            ) : null}

            {error && (
              <div className="mb-4 p-3 bg-error/5 border border-error/20 rounded-lg flex items-center gap-2 text-error text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-stone-700 mb-2">
                  Enter 6-digit verification code
                </label>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-stone-400" />
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={otp.length !== 6}
              >
                Verify & Continue
              </Button>

              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleSkip}
                className="text-stone-500"
              >
                Skip for now
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-stone-200">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 text-sm text-stone-500 hover:text-primary mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Having trouble? Refresh page
              </button>
            </div>
          </>
        )}
      </Card>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/60 text-sm">
        <Heart className="w-4 h-4" />
        <span>M-Plus Matrimony</span>
      </div>
    </div>
  );
}
