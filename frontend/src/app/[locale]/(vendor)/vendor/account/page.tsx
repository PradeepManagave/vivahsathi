'use client';

import React, { useState } from 'react';
import { Store, User, Mail, Phone, MapPin, Edit3, Save, X, Camera, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface VendorProfile {
  businessName: string; ownerName: string; email: string; phone: string;
  address: string; city: string; state: string; description: string;
  category: string; website?: string; logo?: string;
}

const mockProfile: VendorProfile = {
  businessName: 'The Peshwa Heritage Palace',
  ownerName: 'Rajesh Deshmukh',
  email: 'contact@peshwapalace.com',
  phone: '+91 98765 43210',
  address: '123 Heritage Road, Camp Area',
  city: 'Pune',
  state: 'Maharashtra',
  description: 'Premium heritage venue for weddings and events since 1920.',
  category: 'Venue',
  website: 'https://peshwapalace.com'
};

export default function VendorAccountPage() {
  const [profile, setProfile] = useState<VendorProfile>(mockProfile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<VendorProfile>(mockProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setProfile(form);
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => { setForm(profile); setEditing(false); };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Account Settings</h1><p className="text-gray-500">Manage your vendor profile</p></div>
          {!editing && <Button onClick={() => setEditing(true)} className="flex items-center gap-2"><Edit3 className="w-4 h-4" />Edit Profile</Button>}
          {editing && <div className="flex gap-2"><Button variant="outline" onClick={handleCancel}><X className="w-4 h-4 mr-1" />Cancel</Button><Button onClick={handleSave} disabled={saving}><Loader2 className={`w-4 h-4 mr-1 ${saving ? 'animate-spin' : 'hidden'}`} /><Save className="w-4 h-4 mr-1" />Save</Button></div>}
        </div>

        {saved && <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2"><CheckCircle className="w-4 h-4" />Profile updated successfully</div>}

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center relative">
              <Store className="w-8 h-8 text-amber-600" />
              <button className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow border"><Camera className="w-3.5 h-3.5 text-gray-500" /></button>
            </div>
            <div>
              {editing ? (
                <Input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} className="text-lg font-bold" />
              ) : <h2 className="text-xl font-bold">{profile.businessName}</h2>}
              <p className="text-sm text-gray-500">{profile.category}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Owner Name', key: 'ownerName', icon: User },
              { label: 'Email', key: 'email', icon: Mail, type: 'email' },
              { label: 'Phone', key: 'phone', icon: Phone },
              { label: 'Website', key: 'website', icon: Store },
              { label: 'City', key: 'city', icon: MapPin },
              { label: 'State', key: 'state', icon: MapPin },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><f.icon className="w-3 h-3" />{f.label}</label>
                {editing ? (
                  <Input value={(form as any)[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} type={f.type || 'text'} />
                ) : <p className="font-medium">{(profile as any)[f.key] || '-'}</p>}
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1">Address</label>
              {editing ? (
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={2} />
              ) : <p className="font-medium">{profile.address}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 mb-1">Description</label>
              {editing ? (
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={3} />
              ) : <p className="text-sm text-gray-700">{profile.description}</p>}
            </div>
          </div>
        </Card>
      </div>

      <nav className="fixed bottom-0 w-full z-50 rounded-t-xl bg-surface border-t border-stone-200/20 h-20 px-4 flex justify-around items-center">
        <a href="/vendor" className="flex flex-col items-center text-stone-500 opacity-70"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg><span className="text-[10px] font-bold uppercase mt-1">Dashboard</span></a>
        <a href="/vendor/listings" className="flex flex-col items-center text-stone-500 opacity-70"><Store className="w-6 h-6" /><span className="text-[10px] font-bold uppercase mt-1">Listings</span></a>
        <a href="/vendor/inquiries" className="flex flex-col items-center text-stone-500 opacity-70"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg><span className="text-[10px] font-bold uppercase mt-1">Inquiries</span></a>
        <a href="/vendor/account" className="flex flex-col items-center text-primary"><User className="w-6 h-6" /><span className="text-[10px] font-bold uppercase mt-1">Account</span></a>
      </nav>
    </div>
  );
}
