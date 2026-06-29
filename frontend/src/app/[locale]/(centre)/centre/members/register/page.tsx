'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Calendar, Heart, GraduationCap, Briefcase,
  MapPin, Camera, Upload, X, Check, AlertCircle, Loader2
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

interface FormData {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  religion: string;
  caste: string;
  education: string;
  occupation: string;
  city: string;
  photo: string | null;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  religion: '',
  caste: '',
  education: '',
  occupation: '',
  city: '',
  photo: null
};

export default function WalkinRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropPreview, setCropPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropPreview(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = () => {
    if (cropPreview) {
      setFormData(prev => ({ ...prev, photo: cropPreview }));
    }
    setShowCropModal(false);
    setCropPreview(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        email: formData.email || undefined,
        religion: formData.religion,
        caste: formData.caste,
        education: formData.education,
        occupation: formData.occupation || undefined,
        city: formData.city,
        photo: formData.photo || undefined
      };

      const response = await apiClient.post(API_ENDPOINTS.centre.registerWalkin, payload);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/centre/members');
        }, 2000);
      } else {
        setError(response.error?.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.firstName && formData.lastName && formData.gender && 
    formData.dateOfBirth && formData.phone.length === 10;
  const isStep2Valid = formData.religion && formData.caste && formData.education;

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18 ? `${age} years` : 'Must be 18+';
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
          <p className="text-gray-500 mb-4">
            The registration has been submitted for approval. The member will receive an SMS once approved.
          </p>
          <p className="text-sm text-gray-400">Redirecting to members list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Walk-in Registration</h1>
        <p className="text-gray-500">Register a new member at your centre</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#570013]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#570013] text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="font-medium">Personal Info</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200">
            <div className={`h-full bg-[#570013] transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#570013]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#570013] text-white' : 'bg-gray-200'}`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="font-medium">Background</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200">
            <div className={`h-full bg-[#570013] transition-all ${step >= 3 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#570013]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#570013] text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="font-medium">Photo & Review</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-2xl mx-auto">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-[#570013]" />
              Personal Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['male', 'female', 'other'].map((g) => (
                    <button
                      key={g}
                      onClick={() => handleInputChange('gender', g)}
                      className={`p-3 border rounded-lg capitalize transition-colors ${
                        formData.gender === g 
                          ? 'border-[#570013] bg-[#570013]/5 text-[#570013]' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                />
                {formData.dateOfBirth && (
                  <p className="text-xs text-gray-500 mt-1">
                    Age: {calculateAge(formData.dateOfBirth)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                    placeholder="9876543210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="px-6 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next: Background
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Background */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#570013]" />
              Religious & Background
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Religion *</label>
                <select
                  value={formData.religion}
                  onChange={(e) => handleInputChange('religion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                >
                  <option value="">Select Religion</option>
                  <option value="hindu">Hindu</option>
                  <option value="muslim">Muslim</option>
                  <option value="christian">Christian</option>
                  <option value="sikh">Sikh</option>
                  <option value="buddhist">Buddhist</option>
                  <option value="jain">Jain</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caste *</label>
                <input
                  type="text"
                  value={formData.caste}
                  onChange={(e) => handleInputChange('caste', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                  placeholder="Enter caste"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education *</label>
                <select
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                >
                  <option value="">Select Education</option>
                  <option value="high_school">High School</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="graduation">Graduation</option>
                  <option value="post_graduation">Post Graduation</option>
                  <option value="doctorate">Doctorate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                  placeholder="Enter occupation"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                placeholder="Enter city"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!isStep2Valid}
                className="px-6 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next: Photo & Review
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Photo & Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#570013]" />
              Photo & Review
            </h2>

            {/* Photo Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {formData.photo ? (
                  <div className="relative">
                    <img 
                      src={formData.photo} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#570013]/20"
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, photo: null }))}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#570013] transition-colors"
                  >
                    <Camera className="w-8 h-8 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-2">Click to upload member photo (optional)</p>
            </div>

            {/* Review Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Review Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{formData.firstName} {formData.lastName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <span className="ml-2 font-medium capitalize">{formData.gender}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2 font-medium">+91 {formData.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Religion:</span>
                  <span className="ml-2 font-medium capitalize">{formData.religion}</span>
                </div>
                <div>
                  <span className="text-gray-500">Caste:</span>
                  <span className="ml-2 font-medium">{formData.caste}</span>
                </div>
                <div>
                  <span className="text-gray-500">Education:</span>
                  <span className="ml-2 font-medium">{formData.education?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Registration will be sent for approval</p>
                  <p className="mt-1">After submission, the registration will be reviewed by Site Admin before the member account is created.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Check className="w-4 h-4" />
                Submit for Approval
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCropModal(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Crop Photo</h3>
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
              {cropPreview && (
                <img src={cropPreview} alt="Crop preview" className="w-full h-full object-contain" />
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
