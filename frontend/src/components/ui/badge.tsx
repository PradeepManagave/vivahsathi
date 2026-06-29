import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'success' | 'warning' | 'error' | 'outline';
  dot?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  gold: 'badge-gold',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  outline: 'badge-outline',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'primary', dot = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`${variantClasses[variant] || variantClasses.primary} ${className}`}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 inline-block" />}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
