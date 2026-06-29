'use client';

import React, { useState } from 'react';
import { Settings, Globe, Mail, Bell, Shield, Palette, Database, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'backup', label: 'Backup', icon: Database }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-headline">Settings</h1>
          <p className="text-stone-500 mt-1">Configure platform settings</p>
        </div>
        <Button variant="primary" onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs tabs={tabs.map((t) => ({ id: t.id, label: t.label }))} value={activeTab} onChange={setActiveTab}>
        <div className="mt-4" />
      </Tabs>

      <Card className="p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              General Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Site Name</label>
                <Input defaultValue="M-Plus Matrimony" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Site URL</label>
                <Input defaultValue="https://mplus.example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Admin Email</label>
                <Input type="email" defaultValue="admin@mplus.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Support Phone</label>
                <Input defaultValue="+91 1800-XXX-XXXX" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-2">Site Description</label>
                <Textarea defaultValue="India&apos;s most trusted matrimony platform" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Default Language</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Timezone</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-stone-200">
              <Checkbox label="Enable user registration" defaultChecked />
              <Checkbox label="Enable email verification" defaultChecked />
              <Checkbox label="Enable SMS notifications" defaultChecked />
              <Checkbox label="Enable two-factor authentication" />
              <Checkbox label="Allow public profile viewing" defaultChecked />
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Email Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">SMTP Host</label>
                <Input defaultValue="smtp.sendgrid.net" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">SMTP Port</label>
                <Input defaultValue="587" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">SMTP Username</label>
                <Input defaultValue="apikey" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">SMTP Password</label>
                <Input type="password" defaultValue="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">From Email</label>
                <Input defaultValue="noreply@mplus.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">From Name</label>
                <Input defaultValue="M-Plus Matrimony" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-stone-200">
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Test Connection
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Settings
            </h2>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-stone-700">Email Notifications</h3>
              <Checkbox label="New member registration" defaultChecked />
              <Checkbox label="Payment received" defaultChecked />
              <Checkbox label="Interest received" defaultChecked />
              <Checkbox label="Message received" defaultChecked />
              <Checkbox label="Profile viewed" />
              <Checkbox label="KYC status change" defaultChecked />

              <h3 className="text-sm font-medium text-stone-700 pt-4">Push Notifications</h3>
              <Checkbox label="New messages" defaultChecked />
              <Checkbox label="New interests" defaultChecked />
              <Checkbox label="Match recommendations" defaultChecked />
              <Checkbox label="Membership expiry" defaultChecked />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Session Timeout (minutes)</label>
                <Input type="number" defaultValue="60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Max Login Attempts</label>
                <Input type="number" defaultValue="5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Password Min Length</label>
                <Input type="number" defaultValue="8" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Lockout Duration (minutes)</label>
                <Input type="number" defaultValue="30" />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-stone-200">
              <Checkbox label="Require 2FA for admins" defaultChecked />
              <Checkbox label="Require strong passwords" defaultChecked />
              <Checkbox label="Enable IP whitelisting for admin" />
              <Checkbox label="Log all admin actions" defaultChecked />
              <Checkbox label="Enable reCAPTCHA on login" />
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Appearance Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <Input type="color" defaultValue="#570013" className="w-16 p-1" />
                  <Input defaultValue="#570013" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Secondary Color</label>
                <div className="flex gap-2">
                  <Input type="color" defaultValue="#7b5800" className="w-16 p-1" />
                  <Input defaultValue="#7b5800" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Logo URL</label>
                <Input defaultValue="/logo.png" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Favicon URL</label>
                <Input defaultValue="/favicon.ico" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Backup & Restore
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Backup Frequency</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Retention Period</label>
                <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm">
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-stone-200">
              <Button variant="primary">Create Backup Now</Button>
              <Button variant="outline">Restore from Backup</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
