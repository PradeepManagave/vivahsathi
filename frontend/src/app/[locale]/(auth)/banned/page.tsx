'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Mail, Phone, ArrowLeft, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function BannedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-error/10 via-surface to-primary-600/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg relative z-10 p-8 bg-white/95 backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ban className="w-10 h-10 text-error" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-headline">Account Suspended</h1>
          <p className="text-stone-500 mt-2">
            Your account has been suspended due to a violation of our terms of service.
          </p>
        </div>

        <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-stone-900 mb-1">Why was my account suspended?</h3>
              <p className="text-sm text-stone-600">
                Accounts may be suspended for: fake profiles, inappropriate behavior, spam, harassment, 
                or violation of our community guidelines.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-stone-700">Email Support</p>
              <p className="text-sm text-stone-500">support@mplus.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-stone-700">Phone Support</p>
              <p className="text-sm text-stone-500">+91 1800-XXX-XXXX</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() => window.location.href = 'mailto:support@mplus.com?subject=Account Suspension Appeal'}
          >
            Appeal Suspension
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </div>

        <p className="text-xs text-stone-400 text-center mt-6">
          If you believe this is an error, please contact our support team with your account details.
        </p>
      </Card>
    </div>
  );
}
