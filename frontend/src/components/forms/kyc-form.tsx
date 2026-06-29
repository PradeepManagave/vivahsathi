'use client';

import React, { useState } from 'react';
import { Video, Camera, User, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stepper } from '@/components/ui/stepper';
import { cn } from '@/lib/utils';

interface KYCFormProps {
  onStartSession: (data: KYCData) => Promise<void>;
  onCompleteSession: (sessionId: string) => Promise<void>;
  processing?: boolean;
  className?: string;
}

interface KYCData {
  documentType: string; documentNumber: string; fullName: string; dateOfBirth: string; address: string;
}

const steps = [
  { label: 'Document Details', description: 'Upload your ID proof' },
  { label: 'Video Verification', description: 'Live KYC session' },
  { label: 'Confirmation', description: 'Review & complete' },
];

const docTypes = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'voter', label: 'Voter ID' },
  { value: 'driving', label: "Driver's License" },
];

export function KYCForm({ onStartSession, onCompleteSession, processing, className }: KYCFormProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<KYCData>({ documentType: '', documentNumber: '', fullName: '', dateOfBirth: '', address: '' });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof KYCData, value: string) => setData(d => ({ ...d, [field]: value }));

  const handleStartSession = async () => {
    setError(null);
    try { await onStartSession(data); setSessionActive(true); setStep(1); } catch (e: any) { setError(e?.message || 'Failed to start session'); }
  };

  const handleComplete = async () => {
    if (!sessionId) return;
    setError(null);
    try { await onCompleteSession(sessionId); setStep(2); } catch (e: any) { setError(e?.message || 'Failed to complete session'); }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Stepper steps={steps} currentStep={step} />

      {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}

      {step === 0 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Document Type</label>
            <Select value={data.documentType} onValueChange={v => update('documentType', v)}>
              <SelectTrigger><SelectValue placeholder="Select document type" /></SelectTrigger>
              <SelectContent>{docTypes.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Document Number</label>
            <Input value={data.documentNumber} onChange={e => update('documentNumber', e.target.value)} placeholder="Enter document number" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Full Name (as on document)</label>
            <Input value={data.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Enter full name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Date of Birth</label>
              <Input value={data.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} type="date" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Address</label>
            <textarea value={data.address} onChange={e => update('address', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder="Enter your address" />
          </div>
          <Button onClick={handleStartSession} fullWidth disabled={!data.documentType || !data.documentNumber || !data.fullName || processing}>
            {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Video className="w-4 h-4 mr-2" />}Start Video KYC
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="text-center space-y-4 py-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <Camera className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold">Video KYC Session</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">Look directly at the camera and ensure proper lighting. Your session is being recorded for verification purposes.</p>
          <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center max-w-lg mx-auto">
            <div className="text-center text-white"><Camera className="w-12 h-12 mx-auto mb-2 opacity-50" /><p className="text-sm opacity-70">Camera feed active</p></div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={handleComplete} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}Complete Verification
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="text-center space-y-4 py-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-700">KYC Submitted Successfully!</h3>
          <p className="text-sm text-gray-500">Your KYC documents are being reviewed. You will be notified once verified.</p>
          <Button variant="outline" onClick={() => { setStep(0); setData({ documentType: '', documentNumber: '', fullName: '', dateOfBirth: '', address: '' }); setSessionId(null); }}>
            Submit Another
          </Button>
        </div>
      )}
    </div>
  );
}
