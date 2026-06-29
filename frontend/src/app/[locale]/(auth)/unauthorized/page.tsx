'use client';

import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, Shield, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-warning/10 via-surface to-primary-600/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg relative z-10 p-8 bg-white/95 backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-headline">Access Denied</h1>
          <p className="text-stone-500 mt-2">
            You don&apos;t have permission to access this page.
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-stone-900 mb-1">Possible reasons:</h3>
              <ul className="text-sm text-stone-600 space-y-1">
                <li>Your session may have expired</li>
                <li>You need a different role to access this area</li>
                <li>Your account permissions have changed</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push('/dashboard')}
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
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
          If you believe you should have access, please contact your administrator.
        </p>
      </Card>
    </div>
  );
}
