'use client';

import React, { useState } from 'react';
import { CreditCard, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onPay: (data: { cardNumber: string; expiry: string; cvv: string; name: string }) => Promise<void>;
  processing?: boolean;
  error?: string | null;
  className?: string;
}

export function PaymentForm({ amount, currency = 'INR', onPay, processing = false, error, className }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const formatCard = (v: string) => v.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
  const formatExpiry = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPay({ cardNumber: cardNumber.replace(/\s/g, ''), expiry, cvv, name });
  };

  const valid = cardNumber.replace(/\s/g, '').length >= 13 && expiry.length === 5 && cvv.length >= 3 && name.length > 0;

  const fmtAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
        <div><p className="text-sm text-gray-500">Amount to Pay</p><p className="text-2xl font-bold">{fmtAmount}</p></div>
        <CreditCard className="w-8 h-8 text-gray-400" />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-500">Cardholder Name</label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" disabled={processing} />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Card Number</label>
        <Input value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} disabled={processing} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Expiry Date</label>
          <Input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} disabled={processing} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-500">CVV</label>
          <Input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" type="password" maxLength={4} disabled={processing} />
        </div>
      </div>

      {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}

      <Button type="submit" fullWidth disabled={!valid || processing} size="lg">
        {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</> : <><Lock className="w-4 h-4 mr-2" />Pay {fmtAmount}</>}
      </Button>

      <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1"><Lock className="w-3 h-3" />Secured by Razorpay</p>
    </form>
  );
}
