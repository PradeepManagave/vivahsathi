'use client';

import { useState } from 'react';
import { 
  MessageCircle, Share2, Download, Copy, CheckCircle,
  Heart, Star, MapPin, User, Phone, Mail, Calendar
} from 'lucide-react';

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    height: string;
    religion: string;
    caste: string;
    location: string;
    education: string;
    occupation: string;
    phone?: string;
    email?: string;
    compatibility?: number;
    isVerified?: boolean;
  };
  onShare?: () => void;
}

export default function WhatsAppProfileCard({ profile, onShare }: ProfileCardProps) {
  const [copied, setCopied] = useState(false);
  const [showFullCard, setShowFullCard] = useState(false);

  const shareOnWhatsApp = () => {
    const message = `
*🪔 The Heritage - M-Plus Matrimony 🪔*

*Profile Shared by Family*

━━━━━━━━━━━━━━━━━━
👤 *${profile.name}*
${profile.age} yrs • ${profile.height}
━━━━━━━━━━━━━━━━━━

📍 *Location:* ${profile.location}
🕉️ *Religion:* ${profile.religion} • ${profile.caste}
🎓 *Education:* ${profile.education}
💼 *Occupation:* ${profile.occupation}

${profile.compatibility ? `⭐ *Match Compatibility:* ${profile.compatibility}%` : ''}
${profile.isVerified ? '✅ *Verified Profile*' : ''}

━━━━━━━━━━━━━━━━━━
📱 *To Connect:*
🔗 Visit: https://heritagematrimony.com/profile/${profile.id}
📞 Call: +91 98765 43210

━━━━━━━━━━━━━━━━━━
*🙏 शुभ मंगल 🙏*
*The Heritage - Heritage of Love*
`.trim();

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onShare?.();
  };

  const copyLink = () => {
    const link = `https://heritagematrimony.com/profile/${profile.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCard = () => {
    const cardContent = `
THE HERITAGE - M-PLUS MATRIMONY
================================

Profile: ${profile.name}
Age: ${profile.age} years
Height: ${profile.height}
Location: ${profile.location}
Religion: ${profile.religion}
Caste: ${profile.caste}
Education: ${profile.education}
Occupation: ${profile.occupation}

${profile.compatibility ? `Match Compatibility: ${profile.compatibility}%` : ''}
${profile.isVerified ? 'Status: Verified' : ''}

To connect, visit:
https://heritagematrimony.com/profile/${profile.id}

================================
🙏 शुभ मंगल 🙏
The Heritage - Heritage of Love
`.trim();

    const blob = new Blob([cardContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, '_')}_Profile.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareOptions = [
    { icon: MessageCircle, label: 'WhatsApp', action: shareOnWhatsApp, color: 'bg-green-500' },
    { icon: Copy, label: copied ? 'Copied!' : 'Copy Link', action: copyLink, color: 'bg-gray-500' },
    { icon: Download, label: 'Download', action: downloadCard, color: 'bg-blue-500' },
    { icon: Share2, label: 'Share', action: () => navigator.share?.({
      title: `${profile.name} - The Heritage`,
      text: `View ${profile.name}'s matrimony profile`,
      url: `https://heritagematrimony.com/profile/${profile.id}`
    }), color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-4">
      {/* Card Preview */}
      <div className="bg-gradient-to-br from-[#570013] to-[#3a000d] rounded-2xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="p-6 text-center text-white">
          <div className="w-20 h-20 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
          <p className="text-white/80">{profile.age} yrs • {profile.height}</p>
          {profile.isVerified && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 rounded-full text-sm mt-2">
              <CheckCircle className="w-4 h-4" /> Verified
            </span>
          )}
        </div>

        {/* Details */}
        <div className="bg-white p-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{profile.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-400" />
              <span>{profile.religion} • {profile.caste}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-gray-400" />
              <span>{profile.education}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{profile.occupation}</span>
            </div>
          </div>

          {profile.compatibility && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-600">Match:</span>
                <span className="text-xl font-bold text-[#570013]">{profile.compatibility}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 text-center">
          <p className="text-white/80 text-sm">
            Connect via *The Heritage - M-Plus Matrimony*
          </p>
          <p className="text-white/60 text-xs mt-1">
            heritagematrimony.com
          </p>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {shareOptions.map((option) => (
          <button
            key={option.label}
            onClick={option.action}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90 ${option.color}`}
          >
            <option.icon className="w-5 h-5" />
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Compact Share Link */}
      <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
        <input
          type="text"
          value={`heritagematrimony.com/profile/${profile.id}`}
          readOnly
          className="flex-1 bg-transparent text-sm"
        />
        <button
          onClick={copyLink}
          className="p-2 hover:bg-gray-200 rounded-lg"
        >
          {copied ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Copy className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Full Card Option */}
      <button
        onClick={() => setShowFullCard(true)}
        className="w-full py-3 border border-[#570013] text-[#570013] rounded-lg font-medium hover:bg-[#570013]/5"
      >
        View Full Profile Card
      </button>

      {/* Full Card Modal */}
      {showFullCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-br from-[#570013] to-[#3a000d] p-8 text-center text-white">
              <div className="w-24 h-24 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
              <p className="text-xl text-white/80">{profile.age} yrs • {profile.height}</p>
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 px-4 py-2 bg-green-500 rounded-full text-sm mt-3">
                  <CheckCircle className="w-4 h-4" /> Verified Profile
                </span>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium">{profile.location}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Religion</p>
                  <p className="font-medium">{profile.religion}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Caste</p>
                  <p className="font-medium">{profile.caste}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Education</p>
                  <p className="font-medium">{profile.education}</p>
                </div>
              </div>

              <div className="p-4 bg-[#570013]/5 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">Match Compatibility</p>
                <p className="text-4xl font-bold text-[#570013]">
                  {profile.compatibility || 85}%
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={shareOnWhatsApp}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Share on WhatsApp
                </button>
                <button
                  onClick={downloadCard}
                  className="py-3 px-4 border border-gray-300 rounded-lg"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowFullCard(false)}
                className="w-full py-2 text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
