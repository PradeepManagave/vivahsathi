'use client';

import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';

interface FamilyInfo {
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  brothers: string;
  brothersMarried: string;
  sisters: string;
  sistersMarried: string;
  familyType: string;
  familyStatus: string;
  familyValues: string;
  nativePlace: string;
}

export default function ProfileFamilyPage() {
  const [familyInfo, setFamilyInfo] = useState<FamilyInfo>({
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    brothers: '0',
    brothersMarried: '0',
    sisters: '0',
    sistersMarried: '0',
    familyType: 'joint',
    familyStatus: 'middle',
    familyValues: 'traditional',
    nativePlace: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFamilyInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
          <h1 className="text-2xl font-bold text-gray-900">Family Details</h1>
          <p className="text-gray-500">Tell us about your family</p>
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

      {/* Parents Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Parents Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Father&apos;s Name</label>
            <input
              type="text"
              name="fatherName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.fatherName}
              onChange={handleChange}
              placeholder="Enter father's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Father&apos;s Occupation</label>
            <input
              type="text"
              name="fatherOccupation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.fatherOccupation}
              onChange={handleChange}
              placeholder="e.g., Business, Service, Retired"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mother&apos;s Name</label>
            <input
              type="text"
              name="motherName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.motherName}
              onChange={handleChange}
              placeholder="Enter mother's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mother&apos;s Occupation</label>
            <input
              type="text"
              name="motherOccupation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.motherOccupation}
              onChange={handleChange}
              placeholder="e.g., Homemaker, Service"
            />
          </div>
        </div>
      </div>

      {/* Siblings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Siblings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brothers</label>
            <input
              type="number"
              name="brothers"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.brothers}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brothers Married</label>
            <input
              type="number"
              name="brothersMarried"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.brothersMarried}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sisters</label>
            <input
              type="number"
              name="sisters"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.sisters}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sisters Married</label>
            <input
              type="number"
              name="sistersMarried"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.sistersMarried}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Family Background */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Background</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Family Type</label>
            <select
              name="familyType"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.familyType}
              onChange={handleChange}
            >
              <option value="joint">Joint Family</option>
              <option value="nuclear">Nuclear Family</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Family Status</label>
            <select
              name="familyStatus"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.familyStatus}
              onChange={handleChange}
            >
              <option value="middle">Middle Class</option>
              <option value="upper_middle">Upper Middle Class</option>
              <option value="affluent">Affluent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Family Values</label>
            <select
              name="familyValues"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.familyValues}
              onChange={handleChange}
            >
              <option value="traditional">Traditional</option>
              <option value="moderate">Moderate</option>
              <option value="liberal">Liberal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Native Place</label>
            <input
              type="text"
              name="nativePlace"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={familyInfo.nativePlace}
              onChange={handleChange}
              placeholder="e.g., Pune, Maharashtra"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
