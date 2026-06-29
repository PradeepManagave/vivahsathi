// ============================================================
// Site Configuration - M-Plus Matrimony Platform
// ============================================================

export const SiteConfig = {
  name: 'M-Plus Matrimony',
  title: 'M-Plus Matrimony - Find Your Perfect Match',
  description:
    'M-Plus Matrimony is India\'s trusted matrimonial platform with verified profiles, Video KYC, and AI-powered matching. Find your perfect partner today.',
  keywords: 'matrimony, marriage, Indian matrimony, match making, vivah sathi',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://mplus.example.com',
  supportEmail: 'support@mplus.example.com',
  supportPhone: '+91 98765 43210',
  supportHours: 'Mon-Sat: 9 AM - 6 PM',
  twitterHandle: '@mplussathi',
  linkedIn: 'https://linkedin.com/company/mplus-matrimony',
  facebook: 'https://facebook.com/mplusmatrimony',
  instagram: 'https://instagram.com/mplusmatrimony',
  youtube: 'https://youtube.com/@mplusmatrimony',
  whatsapp: '+919876543210'
} as const;

export const AppConfig = {
  name: 'M-Plus Matrimony',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  apiRetryCount: parseInt(process.env.NEXT_PUBLIC_API_RETRY_COUNT || '3', 10),
  cookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'mplus_auth_token',
  refreshCookieName: process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME || 'mplus_refresh_token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/'
  }
} as const;

export const FeatureFlags = {
  videoKyc: process.env.NEXT_PUBLIC_FEATURE_VIDEO_KYC === 'true',
  videoChat: process.env.NEXT_PUBLIC_FEATURE_VIDEO_CHAT === 'true',
  whatsapp: process.env.NEXT_PUBLIC_FEATURE_WHATSAPP === 'true',
  marketplace: process.env.NEXT_PUBLIC_FEATURE_MARKETPLACE === 'true',
  ads: process.env.NEXT_PUBLIC_FEATURE_ADS === 'true',
  multilingual: process.env.NEXT_PUBLIC_FEATURE_MULTILINGUAL === 'true',
  aiMatches: process.env.NEXT_PUBLIC_FEATURE_AI_MATCHES === 'true'
} as const;

export const MembershipLimits = {
  free: {
    contactsPerDay: parseInt(process.env.NEXT_PUBLIC_FREE_CONTACTS_PER_DAY || '5', 10),
    messageLimit: parseInt(process.env.NEXT_PUBLIC_FREE_MESSAGE_LIMIT || '10', 10),
    maxPhotos: 3,
    canVideoChat: false,
    isAdFree: false,
    canViewSocialLinks: false,
    profileVisibility: 'members_only' as const
  },
  trial: {
    days: parseInt(process.env.NEXT_PUBLIC_TRIAL_DAYS || '7', 10)
  }
} as const;

export const UploadConfig = {
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || '5', 10) * 1024 * 1024, // bytes
  maxPhotos: parseInt(process.env.NEXT_PUBLIC_MAX_PHOTOS_COUNT || '10', 10),
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  thumbnailWidth: 200,
  thumbnailHeight: 200,
  mediumWidth: 600,
  mediumHeight: 800,
  largeWidth: 1200,
  largeHeight: 1600
} as const;

export const PaginationConfig = {
  defaultPageSize: 20,
  maxPageSize: 100,
  pageSizeOptions: [10, 20, 50, 100]
} as const;

export const CacheConfig = {
  profileCacheTime: 5 * 60 * 1000, // 5 minutes
  searchCacheTime: 2 * 60 * 1000, // 2 minutes
  matchesCacheTime: 10 * 60 * 1000 // 10 minutes
} as const;

export const DateTimeConfig = {
  format: {
    date: 'dd MMM yyyy',
    time: 'HH:mm',
    datetime: 'dd MMM yyyy, HH:mm',
    full: 'EEEE, dd MMMM yyyy'
  },
  timezone: 'Asia/Kolkata'
} as const;
