'use client';

import { cn } from '@/lib/utils';

export interface StepperProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Stepper({ steps, currentStep, orientation = 'horizontal', className }: StepperProps) {
  return (
    <div className={cn(orientation === 'horizontal' ? 'flex items-center' : 'flex flex-col gap-2', className)}>
      {steps.map((step, i) => {
        const state = i < currentStep ? 'completed' : i === currentStep ? 'active' : 'pending';
        return (
          <div key={i} className={cn('flex items-center', orientation === 'horizontal' ? 'flex-1 last:flex-none' : 'flex-col')}>
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors',
                state === 'completed' && 'bg-primary border-primary text-white',
                state === 'active' && 'border-primary text-primary',
                state === 'pending' && 'border-gray-300 text-gray-400'
              )}>
                {state === 'completed' ? '✓' : i + 1}
              </div>
              <div className={cn(orientation === 'vertical' ? '' : 'hidden md:block')}>
                <p className={cn('text-sm font-medium', state === 'active' ? 'text-primary' : state === 'completed' ? 'text-gray-900' : 'text-gray-400')}>{step.label}</p>
                {step.description && <p className="text-xs text-gray-400">{step.description}</p>}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                orientation === 'horizontal' ? 'flex-1 h-0.5 mx-4' : 'w-0.5 h-6 ml-4',
                i < currentStep ? 'bg-primary' : 'bg-gray-200'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

