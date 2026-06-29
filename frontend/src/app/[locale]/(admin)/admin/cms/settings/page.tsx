'use client';

import React, { useState } from 'react';
import { 
  Save, Mail, MessageSquare, CreditCard, Percent,
  Globe, Share2, Settings as SettingsIcon, Bell,
  Shield, Key
} from 'lucide-react';

type SettingCategory = 'general' | 'email' | 'sms' | 'payment' | 'tax' | 'advertisement' | 'seo' | 'social';

interface Setting {
  key: string;
  label: string;
  value: string;
  description?: string;
}

const mockSettings: Record<SettingCategory, Setting[]> = {
  general: [
    { key: 'site_name', label: 'Site Name', value: 'Heritage Matrimony', description: 'Your platform name' },
    { key: 'tagline', label: 'Tagline', value: 'Find Your Perfect Match', description: 'Platform tagline' },
    { key: 'support_email', label: 'Support Email', value: 'support@heritagematrimony.com' },
    { key: 'support_phone', label: 'Support Phone', value: '+91 9876543210' },
    { key: 'address', label: 'Address', value: '123 Heritage Building, Mumbai' },
  ],
  email: [
    { key: 'smtp_host', label: 'SMTP Host', value: 'smtp.sendgrid.net' },
    { key: 'smtp_port', label: 'SMTP Port', value: '587' },
    { key: 'smtp_username', label: 'SMTP Username', value: 'apikey' },
    { key: 'smtp_password', label: 'SMTP Password', value: '********', description: 'Encrypted' },
    { key: 'from_email', label: 'From Email', value: 'noreply@heritagematrimony.com' },
    { key: 'from_name', label: 'From Name', value: 'Heritage Matrimony' },
  ],
  sms: [
    { key: 'sms_gateway', label: 'SMS Gateway', value: 'msg91' },
    { key: 'sms_api_key', label: 'API Key', value: '********', description: 'Encrypted' },
    { key: 'sms_sender_id', label: 'Sender ID', value: 'HRTMAT' },
    { key: 'sms_template_id', label: 'OTP Template ID', value: 'TEMPLATE123' },
  ],
  payment: [
    { key: 'razorpay_key', label: 'Razorpay Key', value: 'rzp_live_****' },
    { key: 'razorpay_secret', label: 'Razorpay Secret', value: '********', description: 'Encrypted' },
    { key: 'payment_gateway', label: 'Payment Gateway', value: 'razorpay' },
    { key: 'currency', label: 'Currency', value: 'INR' },
  ],
  tax: [
    { key: 'gst_number', label: 'GST Number', value: '27AABCU9603R1ZM' },
    { key: 'gst_rate', label: 'GST Rate (%)', value: '18' },
    { key: 'tds_rate', label: 'TDS Rate (%)', value: '10' },
  ],
  advertisement: [
    { key: 'ad_slots_homepage', label: 'Homepage Ad Slots', value: '3' },
    { key: 'ad_slots_sidebar', label: 'Sidebar Ad Slots', value: '2' },
    { key: 'ad_slots_profile', label: 'Profile Page Ad Slots', value: '1' },
    { key: 'google_adsense_id', label: 'Google AdSense ID', value: 'ca-pub-****' },
  ],
  seo: [
    { key: 'meta_title', label: 'Default Meta Title', value: 'Heritage Matrimony - Find Your Perfect Match' },
    { key: 'meta_description', label: 'Default Meta Description', value: 'Find your perfect partner on Heritage Matrimony...' },
    { key: 'meta_keywords', label: 'Default Meta Keywords', value: 'matrimony, wedding, match, partner' },
    { key: 'og_image', label: 'OG Image URL', value: 'https://heritagematrimony.com/og-image.jpg' },
  ],
  social: [
    { key: 'facebook_url', label: 'Facebook URL', value: 'https://facebook.com/heritagematrimony' },
    { key: 'instagram_url', label: 'Instagram URL', value: 'https://instagram.com/heritagematrimony' },
    { key: 'twitter_url', label: 'Twitter URL', value: 'https://twitter.com/heritagematrimony' },
    { key: 'youtube_url', label: 'YouTube URL', value: '' },
  ],
};

const categoryIcons: Record<SettingCategory, React.ReactNode> = {
  general: <Globe className="w-5 h-5" />,
  email: <Mail className="w-5 h-5" />,
  sms: <MessageSquare className="w-5 h-5" />,
  payment: <CreditCard className="w-5 h-5" />,
  tax: <Percent className="w-5 h-5" />,
  advertisement: <SettingsIcon className="w-5 h-5" />,
  seo: <Globe className="w-5 h-5" />,
  social: <Share2 className="w-5 h-5" />,
};

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('general');
  const [settings, setSettings] = useState(mockSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    console.log('Saving settings...');
    setHasChanges(false);
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map(s => 
        s.key === key ? { ...s, value } : s
      )
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Configure platform settings</p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            {(Object.keys(settings) as SettingCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${activeCategory === category 
                    ? 'bg-[#570013] text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {categoryIcons[category]}
                <span className="capitalize">{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 capitalize">
              {activeCategory} Settings
            </h2>

            <div className="space-y-6">
              {settings[activeCategory].map((setting) => (
                <div key={setting.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {setting.label}
                  </label>
                  {setting.description === 'Encrypted' ? (
                    <div className="relative">
                      <input
                        type="password"
                        value={setting.value}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent pr-10"
                      />
                      <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  ) : (
                    <input
                      type={setting.key.includes('password') || setting.key.includes('secret') ? 'password' : 'text'}
                      value={setting.value}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                    />
                  )}
                  {setting.description && setting.description !== 'Encrypted' && (
                    <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-6 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save {activeCategory} Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
