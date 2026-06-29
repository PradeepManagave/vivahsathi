import React from 'react';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: React.ReactNode;
}

const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ className = '', src, alt = '', name, size = 'md', fallback, ...props }, ref) => {
    const initials = name
      ? name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : '?';

    const [hasError, setHasError] = React.useState(false);

    if (!src || hasError) {
      return (
        <div
          className={`${sizeClasses[size]} rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold ${className}`}
        >
          {fallback || initials}
        </div>
      );
    }

    return (
      <img
        ref={ref as React.RefObject<HTMLImageElement>}
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={() => setHasError(true)}
        {...props}
      />
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
