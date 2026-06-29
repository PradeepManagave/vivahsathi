import React, { useState, useRef, useEffect } from 'react';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg';
  closeOnClick?: boolean;
}

const widthClasses: Record<string, string> = {
  sm: 'min-w-[160px]',
  md: 'min-w-[200px]',
  lg: 'min-w-[280px]',
};

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'left',
  width = 'md',
  closeOnClick = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div onClick={handleToggle}>{trigger}</div>
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} z-dropdown mt-2 ${widthClasses[width]} bg-white rounded-xl shadow-lg border border-surface-200 py-1 animate-fade-in`}
          onClick={closeOnClick ? () => setIsOpen(false) : undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  divider?: boolean;
  variant?: 'default' | 'danger';
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className = '', icon, divider, variant = 'default', children, ...props }, ref) => {
    if (divider) {
      return <div className="my-1 h-px bg-surface-200" />;
    }

    return (
      <button
        ref={ref}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
          variant === 'danger'
            ? 'text-red-600 hover:bg-red-50'
            : 'text-stone-700 hover:bg-surface-100'
        } ${className}`}
        {...props}
      >
        {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);
DropdownItem.displayName = 'DropdownItem';

export { Dropdown, DropdownItem };
