import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, error, description, id, ...props }, ref) => {
    const checkboxId = id || React.useId();

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={`checkbox ${error ? 'border-error' : ''} mt-0.5 ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        <div className="flex-1">
          {label && (
            <label htmlFor={checkboxId} className="text-sm text-stone-700 cursor-pointer">
              {label}
            </label>
          )}
          {description && <p className="text-xs text-stone-500 mt-0.5">{description}</p>}
          {error && <p className="text-xs text-error mt-1">{error}</p>}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', label, description, id, ...props }, ref) => {
    const radioId = id || React.useId();

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          className={`radio mt-0.5 ${className}`}
          {...props}
        />
        <div className="flex-1">
          {label && (
            <label htmlFor={radioId} className="text-sm text-stone-700 cursor-pointer">
              {label}
            </label>
          )}
          {description && <p className="text-xs text-stone-500 mt-0.5">{description}</p>}
        </div>
      </div>
    );
  }
);
Radio.displayName = 'Radio';

export { Checkbox, Radio };
