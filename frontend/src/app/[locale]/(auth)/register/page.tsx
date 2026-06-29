'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Phone, Lock, User, ChevronLeft, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { useOtp } from '@/hooks/use-otp';

// Step 1: Mobile Schema
const mobileSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number')
});

// Step 2: OTP Schema
const otpSchema = z.object({
  otp: z.string().length(6, 'Enter 6-digit OTP')
});

// Step 3: Basic Details Schema
const detailsSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters').max(50),
  lastName: z.string().min(2, 'At least 2 characters').max(50),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string().refine((date) => {
    const dob = new Date(date);
    const today = new Date();
    const age = Math.floor((today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age >= 18 && age <= 100;
  }, 'Must be 18+ years old'),
  religion: z.string().min(1, 'Select religion'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include uppercase letter')
    .regex(/[a-z]/, 'Include lowercase letter')
    .regex(/[0-9]/, 'Include number')
    .regex(/[@$!%*?&#]/, 'Include special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Step 4: Plan Selection
const planSchema = z.object({
  plan: z.enum(['free', 'silver', 'gold', 'premium'])
});

type MobileForm = z.infer<typeof mobileSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type DetailsForm = z.infer<typeof detailsSchema>;
type PlanForm = z.infer<typeof planSchema>;

const STEPS = [
  { id: 1, title: 'Mobile', icon: Phone },
  { id: 2, title: 'Verify', icon: Lock },
  { id: 3, title: 'Details', icon: User },
  { id: 4, title: 'Plan', icon: Heart }
];

const RELIGIONS = [
  { value: 'hindu', label: 'Hindu' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'christian', label: 'Christian' },
  { value: 'sikh', label: 'Sikh' },
  { value: 'jain', label: 'Jain' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'parsi', label: 'Parsi' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'other', label: 'Other' }
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<MobileForm & OtpForm & DetailsForm & PlanForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { 
    sendOtp, 
    verifyOtp, 
    formattedTime, 
    isSent, 
    isVerified, 
    isLoading: otpLoading,
    error: otpError,
    resendOtp,
    attempts
  } = useOtp({
    onSuccess: (tempToken) => {
      setFormData((prev) => ({ ...prev, tempToken }));
      setCurrentStep(3);
    },
    onError: (err) => setError(err)
  });

  // Form handlers
  const handleMobileSubmit = async (data: MobileForm) => {
    setFormData((prev) => ({ ...prev, ...data }));
    await sendOtp(data.phone);
    if (isSent) setCurrentStep(2);
  };

  const handleOtpSubmit = async (data: OtpForm) => {
    const success = await verifyOtp(data.otp);
    if (success) {
      setCurrentStep(3);
    }
  };

  const handleDetailsSubmit = async (data: DetailsForm) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(4);
  };

  const handlePlanSubmit = async (data: PlanForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<{
        user: { id: string; role: string };
        tokens: { accessToken: string; refreshToken: string };
      }>(
        API_ENDPOINTS.auth.register,
        {
          phone: formData.phone,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          religion: formData.religion,
          password: formData.password,
          membershipPlan: data.plan
        }
      );

      if (!response.success) {
        setError(response.error?.message || 'Registration failed');
        return;
      }

      apiClient.setAuthToken(
        response.data!.tokens.accessToken,
        response.data!.tokens.refreshToken
      );

      router.push('/dashboard');
    } catch (err: unknown) {
      const apiError = (err as { message?: string })?.message || 'An unexpected error occurred';
      setError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string, onChange: (value: string) => void) => {
    if (!/^\d*$/.test(value)) return;
    onChange(value);

    if (value.length === 1 && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent, onChange: (value: string) => void, value: string) => {
    if (e.key === 'Backspace' && !value && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/royal-pattern.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="text-center max-w-md">
            <Heart className="w-20 h-20 text-secondary mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl font-headline font-extrabold text-white mb-4">
              Begin Your Journey
            </h1>
            <p className="text-primary-100 text-lg mb-8">
              Join thousands of verified profiles seeking meaningful relationships. Your perfect match awaits.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-white/90 italic mb-4">
                "Found my soulmate through M-Plus. The verification process gave us confidence to take the next step."
              </p>
              <p className="text-secondary font-semibold">— Priya & Rahul, Mumbai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Multi-step Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-8 lg:hidden">
            <Heart className="w-12 h-12 text-primary mx-auto mb-2" />
            <h1 className="text-2xl font-headline font-extrabold text-primary">M-Plus</h1>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-secondary text-white'
                            : isActive
                            ? 'bg-primary text-white'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span className={`text-xs mt-2 hidden sm:block ${
                        isActive ? 'text-primary font-semibold' : 'text-stone-500'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`w-12 sm:w-20 h-0.5 mx-2 ${
                        isCompleted ? 'bg-secondary' : 'bg-stone-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Mobile */}
          {currentStep === 1 && (
            <MobileStep
              onSubmit={handleMobileSubmit}
              isLoading={otpLoading}
            />
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <OtpStep
              phone={formData.phone!}
              onSubmit={handleOtpSubmit}
              onResend={resendOtp}
              formattedTime={formattedTime}
              isLoading={otpLoading}
              attempts={attempts}
              inputRefs={otpInputRefs}
              onOtpChange={handleOtpChange}
              onOtpKeyDown={handleOtpKeyDown}
              onBack={goBack}
            />
          )}

          {/* Step 3: Basic Details */}
          {currentStep === 3 && (
            <DetailsStep
              onSubmit={handleDetailsSubmit}
              onBack={goBack}
            />
          )}

          {/* Step 4: Plan Selection */}
          {currentStep === 4 && (
            <PlanStep
              onSubmit={handlePlanSubmit}
              onBack={goBack}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Login Link */}
          <p className="mt-8 text-center text-stone-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Step Components
function MobileStep({ onSubmit, isLoading }: { onSubmit: (data: MobileForm) => Promise<void>; isLoading: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<MobileForm>({
    resolver: zodResolver(mobileSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-headline font-bold text-primary mb-2">
          Enter Your Mobile
        </h2>
        <p className="text-stone-600">
          We&apos;ll send you an OTP to verify your number
        </p>
      </div>

      <div className="space-y-2">
        <label className="label">Mobile Number</label>
        <div className="flex gap-2">
          <div className="w-20 bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center text-stone-600 font-medium">
            +91
          </div>
          <Input
            type="tel"
            placeholder="9876543210"
            className="flex-1"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>
      </div>

      <Button type="submit" className="w-full royal-gradient text-white py-4" disabled={isLoading}>
        {isLoading ? 'Sending OTP...' : 'Send OTP'}
      </Button>
    </form>
  );
}

function OtpStep({
  phone,
  onSubmit,
  onResend,
  formattedTime,
  isLoading,
  attempts,
  inputRefs,
  onOtpChange,
  onOtpKeyDown,
  onBack
}: {
  phone: string;
  onSubmit: (data: OtpForm) => Promise<void>;
  onResend: () => Promise<void>;
  formattedTime: string;
  isLoading: boolean;
  attempts: number;
  inputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  onOtpChange: (index: number, value: string, onChange: (v: string) => void) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent, onChange: (v: string) => void, value: string) => void;
  onBack: () => void;
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema)
  });

  const otpValue = watch('otp') || '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-headline font-bold text-primary mb-2">
          Verify OTP
        </h2>
        <p className="text-stone-600">
          Enter the 6-digit code sent to
        </p>
        <p className="text-primary font-semibold">+91 {phone}</p>
        <p className="text-sm text-stone-500 mt-2">
          Time remaining: <span className="text-primary font-mono">{formattedTime}</span>
        </p>
        {attempts > 0 && (
          <p className="text-xs text-red-500 mt-1">
            {3 - attempts} attempts remaining
          </p>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className="w-12 h-14 text-center text-xl font-bold"
            value={otpValue[index] || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onOtpChange(index, e.target.value, (v) => {
              const newOtp = otpValue.substring(0, index) + v + otpValue.substring(index + 1);
              setValue('otp', newOtp);
            })}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => onOtpKeyDown(index, e, (v) => {
              const newOtp = otpValue.substring(0, index) + v + otpValue.substring(index + 1);
              setValue('otp', newOtp);
            }, otpValue[index] || '')}
            ref={(el: HTMLInputElement | null) => { if (el && inputRefs.current) inputRefs.current[index] = el; }}
          />
        ))}
      </div>
      <input type="hidden" {...register('otp')} />

      <Button type="submit" className="w-full royal-gradient text-white py-4" disabled={isLoading || otpValue.length !== 6}>
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </Button>

      <div className="text-center">
        {formattedTime === '0:00' ? (
          <button type="button" onClick={onResend} className="text-primary font-semibold">
            Resend OTP
          </button>
        ) : (
          <p className="text-stone-500 text-sm">
            Didn&apos;t receive code? <span className="text-primary">Resend in {formattedTime}</span>
          </p>
        )}
      </div>

      <button type="button" onClick={onBack} className="w-full text-stone-500 text-sm flex items-center justify-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Change mobile number
      </button>
    </form>
  );
}

function DetailsStep({ onSubmit, onBack }: { onSubmit: (data: DetailsForm) => Promise<void>; onBack: () => void }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      gender: 'male',
      religion: ''
    }
  });

  const password = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-headline font-bold text-primary mb-2">
          Basic Details
        </h2>
        <p className="text-stone-600">
          Tell us about yourself
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="label">First Name</label>
          <Input {...register('firstName')} placeholder="Rahul" error={errors.firstName?.message} />
        </div>
        <div className="space-y-2">
          <label className="label">Last Name</label>
          <Input {...register('lastName')} placeholder="Sharma" error={errors.lastName?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="label">Email (Optional)</label>
        <Input type="email" {...register('email')} placeholder="rahul@example.com" error={errors.email?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="label">Gender</label>
          <select
            {...register('gender')}
            className="input"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="label">Date of Birth</label>
          <Input type="date" {...register('dateOfBirth')} error={errors.dateOfBirth?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="label">Religion</label>
        <select {...register('religion')} className="input">
          <option value="">Select Religion</option>
          {RELIGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        {errors.religion && <p className="error-message">{errors.religion.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="label">Create Password</label>
        <Input
          type="password"
          {...register('password')}
          placeholder="Min 8 chars with uppercase, lowercase, number & special"
          error={errors.password?.message}
        />
        {password && (
          <div className="flex gap-1 mt-2">
            {[
              { regex: /[A-Z]/, label: 'A-Z' },
              { regex: /[a-z]/, label: 'a-z' },
              { regex: /[0-9]/, label: '0-9' },
              { regex: /[@$!%*?&#]/, label: '@$!' },
              { regex: /.{8,}/, label: '8+' }
            ].map(({ regex, label }) => (
              <span
                key={label}
                className={`text-xs px-1.5 py-0.5 rounded ${
                  regex.test(password) ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="label">Confirm Password</label>
        <Input
          type="password"
          {...register('confirmPassword')}
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
        />
      </div>

      <Button type="submit" className="w-full royal-gradient text-white py-4">
        Continue <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <button type="button" onClick={onBack} className="w-full text-stone-500 text-sm flex items-center justify-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
    </form>
  );
}

function PlanStep({ onSubmit, onBack, isSubmitting }: { onSubmit: (data: PlanForm) => Promise<void>; onBack: () => void; isSubmitting: boolean }) {
  const { register, handleSubmit } = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: { plan: 'free' }
  });

  const plans = [
    { id: 'free', name: 'Free', price: '₹0', duration: 'Forever', features: ['Basic profile', '5 contacts/day', 'Ad-supported'] },
    { id: 'silver', name: 'Silver', price: '₹999', duration: '3 Months', features: ['10 contacts/day', 'Send messages', 'No ads'] },
    { id: 'gold', name: 'Gold', price: '₹2,499', duration: '6 Months', features: ['25 contacts/day', 'Video chat', 'Featured profile'] },
    { id: 'premium', name: 'Premium', price: '₹4,999', duration: '1 Year', features: ['Unlimited contacts', 'All features', 'Priority support'] }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-headline font-bold text-primary mb-2">
          Choose Your Plan
        </h2>
        <p className="text-stone-600">
          Select the membership that suits you
        </p>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => (
          <label
            key={plan.id}
            className="flex items-start gap-4 p-4 border-2 border-stone-200 rounded-xl cursor-pointer transition-all hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary-50"
          >
            <input
              type="radio"
              value={plan.id}
              className="mt-1"
              {...register('plan')}
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-primary">{plan.name}</span>
                <span className="font-bold text-lg">{plan.price}</span>
              </div>
              <p className="text-xs text-stone-500">{plan.duration}</p>
              <ul className="mt-2 space-y-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-xs text-stone-600 flex items-center gap-1">
                    <Check className="w-3 h-3 text-secondary" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </label>
        ))}
      </div>

      <Button type="submit" className="w-full royal-gradient text-white py-4" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating Account...
          </span>
        ) : (
          <>Complete Registration</>
        )}
      </Button>

      <button type="button" onClick={onBack} className="w-full text-stone-500 text-sm flex items-center justify-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
    </form>
  );
}
