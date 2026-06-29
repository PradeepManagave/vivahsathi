'use client';

import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (otp: string) => void;
  error?: string;
  disabled?: boolean;
}

export function OtpInput({ length = 6, value = '', onChange, error, disabled }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(value);

  const updateOtp = (val: string) => {
    setOtp(val);
    onChange?.(val);
  };

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const newOtp = otp.split('');
    newOtp[index] = char;
    updateOtp(newOtp.join(''));
    if (char && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) updateOtp(pasted.padEnd(length, ' ').slice(0, length));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary ${otp[i] ? 'border-primary bg-primary/5' : error ? 'border-red-300' : 'border-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        ))}
      </div>
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
