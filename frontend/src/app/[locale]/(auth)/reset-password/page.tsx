'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { authService } from '@/lib/api/services/auth.service';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = (pass: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score, label: 'Good', color: 'bg-green-500' };
    return { score, label: 'Strong', color: 'bg-green-600' };
  };

  const strength = passwordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({ token, newPassword });
      setSuccess(true);
      toast.success('Password reset successfully');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <Card className="w-full max-w-md text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Password Reset!</h1>
          <p className="text-stone-500 mb-6">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <Link href="/login">
            <Button variant="primary" fullWidth>Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-md p-8">
        <Link href="/forgot-password" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Reset Password</h1>
            <p className="text-sm text-stone-500">Create a new secure password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={error}
              required
              minLength={8}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:bg-surface-100 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            {newPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= strength.score ? strength.color : 'bg-surface-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-500">Strength: {strength.label}</p>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="p-1 hover:bg-surface-100 rounded"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <ul className="text-xs text-stone-500 space-y-1">
            <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
              {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
            </li>
            <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
              {/[A-Z]/.test(newPassword) ? '✓' : '○'} One uppercase letter
            </li>
            <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>
              {/[0-9]/.test(newPassword) ? '✓' : '○'} One number
            </li>
          </ul>

          <Button variant="primary" fullWidth loading={loading} type="submit">
            Reset Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
