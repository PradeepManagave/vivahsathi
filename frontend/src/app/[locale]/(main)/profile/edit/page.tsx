'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Calendar, MapPin, Briefcase, Heart, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { profileService } from '@/lib/api/services/profile.service';
import { toast } from 'sonner';

const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'Jewish', 'Other'];
const maritalStatuses = ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce', 'Separated'];
const diets = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Jain'];
const smokingOptions = ['No', 'Yes', 'Occasionally'];
const drinkingOptions = ['No', 'Yes', 'Occasionally', 'Socially'];
const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

interface ProfileFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  motherTongue: string;
  highestEducation: string;
  occupation: string;
  annualIncome: string;
  workLocation: string;
  diet: string;
  smoking: string;
  drinking: string;
  aboutMe: string;
  expectations: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    heightCm: '',
    weightKg: '',
    maritalStatus: '',
    religion: '',
    caste: '',
    motherTongue: '',
    highestEducation: '',
    occupation: '',
    annualIncome: '',
    workLocation: '',
    diet: '',
    smoking: '',
    drinking: '',
    aboutMe: '',
    expectations: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileService.getMyProfile();
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profile.gender || '',
        heightCm: profile.heightCm?.toString() || '',
        weightKg: profile.weightKg?.toString() || '',
        maritalStatus: profile.maritalStatus || '',
        religion: profile.religion || '',
        caste: profile.caste || '',
        motherTongue: profile.motherTongue || '',
        highestEducation: profile.highestEducation || '',
        occupation: profile.occupation || '',
        annualIncome: profile.annualIncome?.toString() || '',
        workLocation: profile.workLocation || '',
        diet: profile.diet || '',
        smoking: profile.smoking || '',
        drinking: profile.drinking || '',
        aboutMe: profile.aboutMe || '',
        expectations: profile.expectations || '',
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profileService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as any,
        heightCm: formData.heightCm ? Number(formData.heightCm) : undefined,
        weightKg: formData.weightKg ? Number(formData.weightKg) : undefined,
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        caste: formData.caste,
        motherTongue: formData.motherTongue,
        highestEducation: formData.highestEducation,
        occupation: formData.occupation,
        annualIncome: formData.annualIncome ? Number(formData.annualIncome) : undefined,
        workLocation: formData.workLocation,
        diet: formData.diet,
        smoking: formData.smoking,
        drinking: formData.drinking,
        aboutMe: formData.aboutMe,
        expectations: formData.expectations,
      });
      toast.success('Profile updated successfully');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-surface">
        <Header variant="member" />
        <div className="container-page py-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header variant="member" />
      <div className="container-page py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Edit Profile</h1>
            <p className="text-stone-500">Update your personal information</p>
          </div>
          <Button variant="primary" onClick={handleSubmit} loading={loading} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs
            tabs={[
              { id: 'basic', label: 'Basic Info', icon: <User className="w-4 h-4" /> },
              { id: 'lifestyle', label: 'Lifestyle', icon: <Heart className="w-4 h-4" /> },
              { id: 'career', label: 'Career', icon: <Briefcase className="w-4 h-4" /> },
              { id: 'about', label: 'About', icon: <User className="w-4 h-4" /> },
            ]}
          >
            <TabPanel tabId="basic">
              <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    required
                    leftIcon={<Calendar className="w-4 h-4" />}
                  />
                  <NativeSelect
                    label="Gender"
                    options={genders}
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    required
                  />
                  <Input
                    label="Height (cm)"
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => handleChange('heightCm', e.target.value)}
                    placeholder="e.g., 170"
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => handleChange('weightKg', e.target.value)}
                    placeholder="e.g., 65"
                  />
                  <NativeSelect
                    label="Marital Status"
                    options={maritalStatuses.map((s) => ({ value: s, label: s }))}
                    value={formData.maritalStatus}
                    onChange={(e) => handleChange('maritalStatus', e.target.value)}
                  />
                  <NativeSelect
                    label="Religion"
                    options={religions.map((r) => ({ value: r, label: r }))}
                    value={formData.religion}
                    onChange={(e) => handleChange('religion', e.target.value)}
                  />
                  <Input
                    label="Caste"
                    value={formData.caste}
                    onChange={(e) => handleChange('caste', e.target.value)}
                  />
                  <Input
                    label="Mother Tongue"
                    value={formData.motherTongue}
                    onChange={(e) => handleChange('motherTongue', e.target.value)}
                  />
                </div>
              </Card>
            </TabPanel>

            <TabPanel tabId="lifestyle">
              <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NativeSelect
                    label="Diet"
                    options={diets.map((d) => ({ value: d, label: d }))}
                    value={formData.diet}
                    onChange={(e) => handleChange('diet', e.target.value)}
                  />
                  <NativeSelect
                    label="Smoking"
                    options={smokingOptions.map((s) => ({ value: s, label: s }))}
                    value={formData.smoking}
                    onChange={(e) => handleChange('smoking', e.target.value)}
                  />
                  <NativeSelect
                    label="Drinking"
                    options={drinkingOptions.map((d) => ({ value: d, label: d }))}
                    value={formData.drinking}
                    onChange={(e) => handleChange('drinking', e.target.value)}
                  />
                </div>
              </Card>
            </TabPanel>

            <TabPanel tabId="career">
              <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Highest Education"
                    value={formData.highestEducation}
                    onChange={(e) => handleChange('highestEducation', e.target.value)}
                    placeholder="e.g., B.Tech, MBA"
                  />
                  <Input
                    label="Occupation"
                    value={formData.occupation}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    placeholder="e.g., Software Engineer"
                    leftIcon={<Briefcase className="w-4 h-4" />}
                  />
                  <Input
                    label="Annual Income (₹)"
                    type="number"
                    value={formData.annualIncome}
                    onChange={(e) => handleChange('annualIncome', e.target.value)}
                    placeholder="e.g., 1000000"
                  />
                  <Input
                    label="Work Location"
                    value={formData.workLocation}
                    onChange={(e) => handleChange('workLocation', e.target.value)}
                    placeholder="e.g., Mumbai, Maharashtra"
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                </div>
              </Card>
            </TabPanel>

            <TabPanel tabId="about">
              <Card>
                <div className="space-y-4">
                  <Textarea
                    label="About Me"
                    value={formData.aboutMe}
                    onChange={(e) => handleChange('aboutMe', e.target.value)}
                    placeholder="Tell others about yourself..."
                    rows={4}
                  />
                  <Textarea
                    label="Partner Expectations"
                    value={formData.expectations}
                    onChange={(e) => handleChange('expectations', e.target.value)}
                    placeholder="What are you looking for in a partner..."
                    rows={4}
                  />
                </div>
              </Card>
            </TabPanel>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading} leftIcon={<Save className="w-4 h-4" />}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}



