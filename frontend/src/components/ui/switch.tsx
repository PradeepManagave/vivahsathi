'use client';

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Switch({ checked = false, onChange, label, disabled, size = 'md' }: SwitchProps) {
  const sizes = { sm: { track: 'w-8 h-4', thumb: 'w-3.5 h-3.5', translate: 'translate-x-4' }, md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' }, lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' } };
  const s = sizes[size];

  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`${s.track} rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-gray-300'}`}
      >
        <span className={`${s.thumb} absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform ${checked ? s.translate : ''}`} />
      </button>
      {label && <span className="text-sm font-medium">{label}</span>}
    </label>
  );
}
