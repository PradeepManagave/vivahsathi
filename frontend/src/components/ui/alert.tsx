'use client';

import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const config = {
  info: { icon: Info, bg: 'bg-blue-50 border-blue-200 text-blue-800', iconColor: 'text-blue-500' },
  success: { icon: CheckCircle2, bg: 'bg-green-50 border-green-200 text-green-800', iconColor: 'text-green-500' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50 border-yellow-200 text-yellow-800', iconColor: 'text-yellow-500' },
  error: { icon: AlertCircle, bg: 'bg-red-50 border-red-200 text-red-800', iconColor: 'text-red-500' },
};

export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const { icon: Icon, bg, iconColor } = config[variant];
  return (
    <div className={cn('flex gap-3 p-4 border rounded-lg', bg, className)} role="alert">
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium mb-1">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>}
    </div>
  );
}

