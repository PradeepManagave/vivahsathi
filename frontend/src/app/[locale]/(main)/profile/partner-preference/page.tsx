'use client';

import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';

interface PartnerPreference {
  ageFrom: string;
  ageTo: string;
  heightFrom: string;
  heightTo: string;
  maritalStatus: string[];
  religion: string;
  caste: string;
  motherTongue: string;
  education: string;
  occupation: string;
  incomeFrom: string;
  incomeTo: string;
  location: string;
  manglik: string;
  aboutPartner: string;
}

export default function ProfilePartnerPreferencePage() {
  const [preference, setPreference] = useState<PartnerPreference>({
    ageFrom: '21',
    ageTo: '30',
    heightFrom: '5\'0"',
    heightTo: '5\'8"',
    maritalStatus: ['never_married'],
    religion: 'hindu',
    caste: 'any',
    motherTongue: 'any',
    education: 'any',
    occupation: 'any',
    incomeFrom: 'any',
    incomeTo: 'any',
    location: 'any',
    manglik: 'no_preference',
    aboutPartner: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setPreference(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Preference</h1>
          <p className="text-gray-500">Tell us what you&apos;re looking for in a partner</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Save className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Basic Preferences */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="ageFrom"
                min="18"
                max="70"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                value={preference.ageFrom}
                onChange={handleChange}
                placeholder="From"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                name="ageTo"
                min="18"
                max="70"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                value={preference.ageTo}
                onChange={handleChange}
                placeholder="To"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height Range</label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                name="heightFrom"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                value={preference.heightFrom}
                onChange={handleChange}
                placeholder="From"
              />
              <span className="text-gray-500">to</span>
              <input
                type="text"
                name="heightTo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                value={preference.heightTo}
                onChange={handleChange}
                placeholder="To"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
            <select
              name="maritalStatus"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={preference.maritalStatus[0]}
              onChange={handleChange}
            >
              <option value="never_married">Never Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
              <option value="any">Any</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Manglik</label>
            <select
              name="manglik"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={preference.manglik}
              onChange={handleChange}
            >
              <option value="no_preference">No Preference</option>
              <option value="no">Non-Manglik</option>
              <option value="yes">Manglik</option>
            </select>
          </div>
        </div>
      </div>

      {/* Religious & Cultural */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Religious & Cultural</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
            <select
              name="religion"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={preference.religion}
              onChange={handleChange}
            >
              <option value="any">Any</option>
              <option value="hindu">Hindu</option>
              <option value="muslim">Muslim</option>
              <option value="christian">Christian</option>
              <option value="sikh">Sikh</option>
              <option value="jain">Jain</option>
              <option value="buddhist">Buddhist</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Caste</label>
            <select
              name="caste"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={preference.caste}
              onChange={handleChange}
            >
              <option value="any">Any</option>
              <option value="brahmin">Brahmin</option>
              <option value="maratha">Maratha</option>
              <option value="kshatriya">Kshatriya</option>
              <option value="vaishya">Vaishya</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mother Tongue</label>
            <select
              name="motherTongue"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={preference.motherTongue}
              onChange={handleChange}
            >
              <option value="any">Any</option>
              <option value="marathi">Marathi</option>
              <option value="hindi">Hindi</option>
              <option value="english">English</option>
              <option value="tamil">Tamil</option>
              <option value="telugu">Telugu</option>
              <option value="kannada">Kannada</option>
              <option value="malayalam">Malayalam</option>
              <option value="gujarati">Gujarati</option>
              <option value="bengali">Bengali</option>
            </select>
          </div>
        </div>
      </div>

      {/* Professional & Financial */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional & Financial</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
            <select
              name="education"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={preference.education}
              onChange={handleChange}
            >
              <option value="any">Any</option>
              <option value="high_school">High School</option>
              <option value="bachelors">Bachelor&apos;s Degree</option>
              <option value="masters">Master&apos;s Degree</option>
              <option value="doctorate">Doctorate</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
            <select
              name="occupation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={preference.occupation}
              onChange={handleChange}
            >
              <option value="any">Any</option>
              <option value="employed">Employed</option>
              <option value="business">Business</option>
              <option value="professional">Professional</option>
              <option value="government">Government</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Income Range (Annual)</label>
            <div className="flex items-center gap-4">
              <select
                name="incomeFrom"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                value={preference.incomeFrom}
                onChange={handleChange}
              >
                <option value="any">Any</option>
                <option value="3">₹3L+</option>
                <option value="5">₹5L+</option>
                <option value="10">₹10L+</option>
                <option value="20">₹20L+</option>
              </select>
              <span className="text-gray-500">to</span>
              <select
                name="incomeTo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                value={preference.incomeTo}
                onChange={handleChange}
              >
                <option value="any">Any</option>
                <option value="10">₹10L</option>
                <option value="20">₹20L</option>
                <option value="50">₹50L</option>
                <option value="100">₹1Cr+</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Location</label>
            <input
              type="text"
              name="location"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={preference.location}
              onChange={handleChange}
              placeholder="e.g., Mumbai, Pune, Any"
            />
          </div>
        </div>
      </div>

      {/* About Partner */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About Your Partner</h2>
        <textarea
          name="aboutPartner"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent resize-none"
          value={preference.aboutPartner}
          onChange={handleChange}
          placeholder="Describe what you&apos;re looking for in a partner..."
        />
        <p className="text-sm text-gray-500 mt-2">Optional: Share additional preferences or expectations</p>
      </div>
    </div>
  );
}
