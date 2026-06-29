'use client';

import React, { useState } from 'react';
import { Save, Upload, Loader2, Star } from 'lucide-react';

interface HoroscopeInfo {
  hasHoroscope: string;
  manglik: string;
  birthTime: string;
  birthPlace: string;
  raasi: string;
  nakshatra: string;
  gothram: string;
  horoscopeFile: string | null;
}

export default function ProfileHoroscopePage() {
  const [horoscope, setHoroscope] = useState<HoroscopeInfo>({
    hasHoroscope: 'yes',
    manglik: 'no',
    birthTime: '',
    birthPlace: '',
    raasi: '',
    nakshatra: '',
    gothram: '',
    horoscopeFile: null
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setHoroscope(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (horoscope.hasHoroscope === 'no') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horoscope</h1>
          <p className="text-gray-500">Manage your horoscope details</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center py-8">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Horoscope Not Available</h2>
            <p className="text-gray-500 mb-6">You have chosen not to share horoscope details</p>
            <button
              onClick={() => setHoroscope(prev => ({ ...prev, hasHoroscope: 'yes' }))}
              className="px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] transition-colors"
            >
              Add Horoscope Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horoscope</h1>
          <p className="text-gray-500">Enter your birth and horoscope details</p>
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

      {/* Horoscope Availability */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Horoscope Availability</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="hasHoroscope"
              value="yes"
              checked={horoscope.hasHoroscope === 'yes'}
              onChange={handleChange}
              className="w-4 h-4 text-[#570013]"
            />
            <span>Yes, I have horoscope</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="hasHoroscope"
              value="no"
              checked={horoscope.hasHoroscope === 'no'}
              onChange={handleChange}
              className="w-4 h-4 text-[#570013]"
            />
            <span>No, I don&apos;t have horoscope</span>
          </label>
        </div>
      </div>

      {/* Birth Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Birth Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time of Birth</label>
            <input
              type="time"
              name="birthTime"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={horoscope.birthTime}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth</label>
            <input
              type="text"
              name="birthPlace"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={horoscope.birthPlace}
              onChange={handleChange}
              placeholder="e.g., Mumbai, Maharashtra"
            />
          </div>
        </div>
      </div>

      {/* Astrological Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Astrological Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Manglik Status</label>
            <select
              name="manglik"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={horoscope.manglik}
              onChange={handleChange}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
              <option value="dont_know">Don&apos;t Know</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Raasi (Moon Sign)</label>
            <input
              type="text"
              name="raasi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={horoscope.raasi}
              onChange={handleChange}
              placeholder="e.g., Mesha, Vrishabha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nakshatra</label>
            <input
              type="text"
              name="nakshatra"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={horoscope.nakshatra}
              onChange={handleChange}
              placeholder="e.g., Ashwini, Bharani"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gothram</label>
            <input
              type="text"
              name="gothram"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={horoscope.gothram}
              onChange={handleChange}
              placeholder="Enter gothram"
            />
          </div>
        </div>
      </div>

      {/* Upload Horoscope */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Horoscope</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Upload your horoscope PDF or image</p>
          <p className="text-sm text-gray-500">PDF, JPG, PNG up to 5MB</p>
          <button className="mt-4 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] transition-colors">
            Upload File
          </button>
        </div>
      </div>
    </div>
  );
}
