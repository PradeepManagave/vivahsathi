import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'title' | 'avatar' | 'rect' | 'circle';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const variantClass =
    variant === 'title'
      ? 'skeleton-title'
      : variant === 'text'
      ? 'skeleton-text'
      : variant === 'avatar'
      ? 'skeleton-avatar'
      : variant === 'circle'
      ? 'skeleton rounded-full'
      : 'skeleton';

  const style = { width, height };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${variantClass} ${className}`} style={style} />
      ))}
    </>
  );
};

export interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ lines = 3, showAvatar = false, showImage = false }) => {
  return (
    <div className="card p-6 space-y-4">
      {showImage && <Skeleton variant="rect" height="200px" className="w-full rounded-xl" />}
      <div className="flex items-center gap-3">
        {showAvatar && <Skeleton variant="avatar" width="40px" height="40px" />}
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" width="40%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '70%' : '100%'} />
      ))}
    </div>
  );
};

export { Skeleton, SkeletonCard };
