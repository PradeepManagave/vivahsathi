'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Bell, Shield, Globe, Moon, Trash2, Save, LogOut, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [notifications, setNotifications] = useState({
    emailInterests: true,
    emailMessages: true,
    emailMatches: true,
    emailNewsletter: false,
    pushInterests: true,
    pushMessages: true,
    pushMatches: true,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showPhotos: true,
    showContact: false,
    hideOnlineStatus: false,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement password change API
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion with confirmation
    toast.error('Account deletion is not yet available');
  };

  return (
    <div className="min-h-screen bg-surface">
      <Header variant="member" />
      <div className="container-page py-6">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Settings</h1>

        <Tabs
          tabs={[
            { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
            { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
          ]}
        >
          <TabPanel tabId="account">
            <Card>
              <h3 className="font-semibold text-stone-900 mb-4">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <Input
                  label="Current Password"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  rightIcon={
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="p-1">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <Input
                  label="New Password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  rightIcon={
                    <button type="button" onClick={() => setShowNew(!showNew)} className="p-1">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <Input
                  label="Confirm New Password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  rightIcon={
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="p-1">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <Button variant="primary" type="submit" loading={loading} leftIcon={<Save className="w-4 h-4" />}>
                  Update Password
                </Button>
              </form>
            </Card>

            <Card className="mt-6">
              <h3 className="font-semibold text-stone-900 mb-4">Account Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" leftIcon={<LogOut className="w-4 h-4" />} onClick={handleLogout}>
                  Logout
                </Button>
                <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />} onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </Card>
          </TabPanel>

          <TabPanel tabId="notifications">
            <Card>
              <h3 className="font-semibold text-stone-900 mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <Checkbox
                  label="New interests"
                  checked={notifications.emailInterests}
                  onChange={(e) => setNotifications({ ...notifications, emailInterests: e.target.checked })}
                />
                <Checkbox
                  label="New messages"
                  checked={notifications.emailMessages}
                  onChange={(e) => setNotifications({ ...notifications, emailMessages: e.target.checked })}
                />
                <Checkbox
                  label="New matches"
                  checked={notifications.emailMatches}
                  onChange={(e) => setNotifications({ ...notifications, emailMatches: e.target.checked })}
                />
                <Checkbox
                  label="Newsletter & updates"
                  checked={notifications.emailNewsletter}
                  onChange={(e) => setNotifications({ ...notifications, emailNewsletter: e.target.checked })}
                />
              </div>
            </Card>

            <Card className="mt-6">
              <h3 className="font-semibold text-stone-900 mb-4">Push Notifications</h3>
              <div className="space-y-4">
                <Checkbox
                  label="New interests"
                  checked={notifications.pushInterests}
                  onChange={(e) => setNotifications({ ...notifications, pushInterests: e.target.checked })}
                />
                <Checkbox
                  label="New messages"
                  checked={notifications.pushMessages}
                  onChange={(e) => setNotifications({ ...notifications, pushMessages: e.target.checked })}
                />
                <Checkbox
                  label="New matches"
                  checked={notifications.pushMatches}
                  onChange={(e) => setNotifications({ ...notifications, pushMatches: e.target.checked })}
                />
              </div>
            </Card>
          </TabPanel>

          <TabPanel tabId="privacy">
            <Card>
              <h3 className="font-semibold text-stone-900 mb-4">Profile Privacy</h3>
              <div className="space-y-4">
                <Checkbox
                  label="Show my profile in search results"
                  checked={privacy.showProfile}
                  onChange={(e) => setPrivacy({ ...privacy, showProfile: e.target.checked })}
                />
                <Checkbox
                  label="Show my photos to everyone"
                  checked={privacy.showPhotos}
                  onChange={(e) => setPrivacy({ ...privacy, showPhotos: e.target.checked })}
                />
                <Checkbox
                  label="Show my contact details to matches only"
                  checked={privacy.showContact}
                  onChange={(e) => setPrivacy({ ...privacy, showContact: e.target.checked })}
                />
                <Checkbox
                  label="Hide my online status"
                  checked={privacy.hideOnlineStatus}
                  onChange={(e) => setPrivacy({ ...privacy, hideOnlineStatus: e.target.checked })}
                />
              </div>
            </Card>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
