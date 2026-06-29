'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

interface InquiryFormProps {
  vendorName: string;
  onSubmit?: (data: InquiryData) => void | Promise<void>;
}

export interface InquiryData {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  message: string;
}

export function InquiryForm({ vendorName, onSubmit }: InquiryFormProps) {
  const [form, setForm] = useState<InquiryData>({
    name: '', email: '', phone: '', eventDate: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) return;
    setSubmitting(true);
    await onSubmit?.(form);
    setSubmitting(false);
  };

  const update = (field: keyof InquiryData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
      <h3 className="font-semibold text-stone-900">Inquire with {vendorName}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input placeholder="Your Name" value={form.name} onChange={update('name')} required />
        <Input type="email" placeholder="Email Address" value={form.email} onChange={update('email')} required />
        <Input type="tel" placeholder="Phone Number" value={form.phone} onChange={update('phone')} required />
        <Input type="date" value={form.eventDate} onChange={update('eventDate')} />
      </div>
      <Textarea placeholder={`Write your message to ${vendorName}...`} value={form.message} onChange={update('message')} rows={4} required />
      <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
        <Send className="w-4 h-4 mr-2" />{submitting ? 'Sending...' : 'Send Inquiry'}
      </Button>
    </form>
  );
}
