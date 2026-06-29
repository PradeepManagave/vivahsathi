'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

export interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({ value, onChange, placeholder = 'Select date', minDate, maxDate, className, error, disabled }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) { document.addEventListener('mousedown', handleClick); return () => document.removeEventListener('mousedown', handleClick); }
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const selected = value ? new Date(value) : null;

  const isDisabled = (day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    if (minDate && d < new Date(minDate)) return true;
    if (maxDate && d > new Date(maxDate)) return true;
    return false;
  };

  const isToday = (day: number) => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return new Date(year, month, day).getTime() === t.getTime();
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    const d = new Date(year, month, day); d.setHours(0, 0, 0, 0);
    return d.getTime() === selected.getTime();
  };

  const handleSelect = (day: number) => {
    const d = new Date(year, month, day);
    const str = d.toISOString().split('T')[0];
    onChange?.(str);
    setOpen(false);
  };

  const formatDisplay = (v: string) => {
    if (!v) return '';
    const d = new Date(v);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className={cn('relative', className)} ref={ref}>
      <div className="relative cursor-pointer" onClick={() => !disabled && setOpen(o => !o)}>
        <Input value={formatDisplay(value || '')} placeholder={placeholder} readOnly disabled={disabled} className={cn('cursor-pointer', error && 'border-red-500')} />
        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {open && (
        <div className="absolute z-50 mt-1 bg-white border rounded-xl shadow-lg p-4 w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-medium text-sm">{months[month]} {year}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekdays.map(d => <span key={d} className="text-xs text-gray-400 font-medium h-8 flex items-center justify-center">{d}</span>)}
            {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const disabled = isDisabled(day);
              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => handleSelect(day)}
                  className={cn(
                    'h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors',
                    isSelected(day) && 'bg-primary text-white',
                    !isSelected(day) && isToday(day) && 'border border-primary text-primary',
                    !isSelected(day) && !isToday(day) && !disabled && 'hover:bg-gray-100 text-gray-700',
                    disabled && 'text-gray-300 cursor-not-allowed'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

