'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or mobile is required'),
  password: z.string().min(1, 'Password is required')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const getDashboardPath = (role: string): string => {
    switch (role) {
      case 'super_admin':
        return '/admin';
      case 'admin':
        return '/admin';
      case 'franchise':
        return '/centre';
      case 'centre':
        return '/centre';
      case 'staff':
        return '/centre';
      default:
        return '/dashboard';
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{
        user: { id: string; role: string };
        tokens: { accessToken: string; refreshToken: string };
      }>(API_ENDPOINTS.auth.login, data);

      if (!response.success) {
        setError(response.error?.message || 'Login failed');
        return;
      }

      apiClient.setAuthToken(
        response.data!.tokens.accessToken,
        response.data!.tokens.refreshToken
      );

      const dashboardPath = getDashboardPath(response.data!.user.role);
      router.push(dashboardPath);
    } catch (err: unknown) {
      const apiError = (err as { message?: string })?.message || 'An unexpected error occurred';
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/royal-pattern.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="text-center max-w-md">
            <Heart className="w-16 h-16 text-secondary mx-auto mb-6" />
            <h1 className="text-4xl font-headline font-extrabold text-white mb-4">
              Welcome Back to M-Plus
            </h1>
            <p className="text-primary-100 text-lg mb-8">
              Your journey to finding the perfect match continues. Sign in to connect with verified profiles.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-2xl font-bold text-secondary">50K+</p>
                <p className="text-xs text-white/80">Active Members</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-2xl font-bold text-secondary">10K+</p>
                <p className="text-xs text-white/80">Success Stories</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-2xl font-bold text-secondary">100%</p>
                <p className="text-xs text-white/80">Verified Profiles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 lg:hidden">
            <Heart className="w-12 h-12 text-primary mx-auto mb-2" />
            <h1 className="text-2xl font-headline font-extrabold text-primary">M-Plus</h1>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-headline font-bold text-primary mb-2">
              Sign In
            </h2>
            <p className="text-stone-600">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Mobile */}
            <div className="space-y-2">
              <label className="label">Email or Mobile</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                  type="text"
                  placeholder="Enter email or mobile number"
                  className="pl-12"
                  error={errors.identifier?.message}
                  {...register('identifier')}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="label">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-12 pr-12"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-stone-600">
                Keep me signed in
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full royal-gradient text-white py-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-surface text-sm text-stone-500">or</span>
            </div>
          </div>

          {/* Social Login */}
          <SocialLoginButtons />

          {/* Register Link */}
          <p className="mt-8 text-center text-stone-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
