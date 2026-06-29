'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { authService } from '@/lib/api/services/auth.service';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword({ identifier });
      setSent(true);
      toast.success('Password reset link sent');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <Card className="w-full max-w-md text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Check Your Inbox</h1>
          <p className="text-stone-500 mb-6">
            We&apos;ve sent password reset instructions to <strong>{identifier}</strong>
          </p>
          <Link href="/login">
            <Button variant="primary" fullWidth>Back to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-md p-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Forgot Password</h1>
            <p className="text-sm text-stone-500">Enter your email or phone to reset</p>
          </div>
        </div>

        <Tabs
          tabs={[
            { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
            { id: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4" /> },
          ]}
        >
          <TabPanel tabId="email">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                error={error}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Button variant="primary" fullWidth loading={loading} type="submit">
                Send Reset Link
              </Button>
            </form>
          </TabPanel>
          <TabPanel tabId="phone">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 XXXXXXXXXX"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                error={error}
                required
                leftIcon={<Phone className="w-4 h-4" />}
              />
              <Button variant="primary" fullWidth loading={loading} type="submit">
                Send OTP
              </Button>
            </form>
          </TabPanel>
        </Tabs>
      </Card>
    </div>
  );
}
