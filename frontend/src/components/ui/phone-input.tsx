'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  countries?: { code: string; dial: string; label: string }[];
  className?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const defaultCountries = [
  { code: 'IN', dial: '+91', label: 'India' },
  { code: 'US', dial: '+1', label: 'United States' },
  { code: 'GB', dial: '+44', label: 'United Kingdom' },
  { code: 'AE', dial: '+971', label: 'UAE' },
  { code: 'SG', dial: '+65', label: 'Singapore' },
  { code: 'CA', dial: '+1', label: 'Canada' },
  { code: 'AU', dial: '+61', label: 'Australia' },
  { code: 'MY', dial: '+60', label: 'Malaysia' },
  { code: 'LK', dial: '+94', label: 'Sri Lanka' },
  { code: 'NP', dial: '+977', label: 'Nepal' },
];

export function PhoneInput({ value = '', onChange, countryCode = '+91', onCountryCodeChange, countries = defaultCountries, className, error, placeholder = 'Enter phone number', disabled }: PhoneInputProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={onCountryCodeChange}>
          <SelectTrigger className="w-[130px] flex-shrink-0">
            <SelectValue>
              <span className="flex items-center gap-1">
                {countries.find(c => c.dial === countryCode)?.code && <CountryFlag code={countries.find(c => c.dial === countryCode)!.code} />}
                {countryCode}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map(c => (
              <SelectItem key={c.code} value={c.dial}>
                <span className="flex items-center gap-2"><CountryFlag code={c.code} />{c.dial} {c.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1">
          <Input value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled} className={error ? 'border-red-500' : ''} />
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function CountryFlag({ code }: { code: string }) {
  const offset = (code.charCodeAt(0) - 65) * 2;
  return <span className="inline-block w-5 h-4 rounded bg-gray-200 text-[8px] font-bold flex items-center justify-center">{code}</span>;
}

