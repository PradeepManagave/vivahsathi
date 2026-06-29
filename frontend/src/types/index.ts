// ============================================================
// Type Definitions - M-Plus Matrimony Platform
// ============================================================

// Common Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// User Types
export type UserRole =
  | 'guest'
  | 'free_member'
  | 'paid_member'
  | 'centre_staff'
  | 'centre_admin'
  | 'super_admin';

export type UserStatus =
  | 'active'
  | 'inactive'
  | 'pending_approval'
  | 'suspended'
  | 'banned';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  phoneCountryCode: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  franchiseCentreId?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  profile?: Profile;
  membership?: UserMembership;
}

// Profile Types
export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName?: string;
  profileSlug: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  complexion?: 'fair' | 'wheatish' | 'dark' | 'very_fair';
  bodyType?: 'slim' | 'average' | 'athletic' | 'heavy';
  physicalStatus: 'normal' | 'disabled';
  religion: string;
  caste?: string;
  subCaste?: string;
  motherTongue?: string;
  gothra?: string;
  gotra?: string;
  highestEducation?: string;
  educationDetails?: string;
  occupation?: string;
  occupationDetails?: string;
  employedIn?: 'private' | 'government' | 'business' | 'self_employed' | 'not_employed';
  annualIncome?: number;
  workLocation?: string;
  diet?: 'veg' | 'non_veg' | 'vegan' | 'jain' | 'occasional';
  smoking?: 'never' | 'occasionally' | 'regularly';
  drinking?: 'never' | 'occasionally' | 'regularly';
  hobbies?: string[];
  aboutMe?: string;
  expectations?: string;
  partnerPreference: PartnerPreference;
  maritalStatus: 'unmarried' | 'divorced' | 'widowed' | 'separated';
  primaryPhotoId?: string;
  kycStatus: 'pending' | 'in_progress' | 'verified' | 'rejected';
  kycVerifiedAt?: string;
  profileVisibility: 'public' | 'members_only' | 'contacts_only' | 'hidden';
  photoVisibility: 'all' | 'contacts_only' | 'premium_only' | 'hidden';
  profileViews: number;
  interestsReceived: number;
  interestsSent: number;
  profileCompletionPercent: number;
  isFeatured: boolean;
  isPremium: boolean;
  isVerified: boolean;
  isOnline: boolean;
  lastActiveAt?: string;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerPreference {
  minAge?: number;
  maxAge?: number;
  minHeightCm?: number;
  maxHeightCm?: number;
  religions?: string[];
  castes?: string[];
  motherTongues?: string[];
  educations?: string[];
  occupations?: string[];
  minIncome?: number;
  maxIncome?: number;
  diet?: string[];
  maritalStatus?: string[];
  countries?: string[];
  states?: string[];
  cities?: string[];
}

export interface FamilyInfo {
  id: string;
  profileId: string;
  familyType?: 'nuclear' | 'joint' | 'extended';
  familyStatus?: 'lower_middle' | 'middle_class' | 'upper_middle' | 'affluent' | 'rich';
  familyValues?: 'traditional' | 'moderate' | 'liberal';
  fatherName?: string;
  fatherOccupation?: string;
  fatherStatus?: 'alive' | 'deceased';
  motherName?: string;
  motherOccupation?: string;
  motherStatus?: 'alive' | 'deceased';
  brothersCount: number;
  brothersMarried: number;
  sistersCount: number;
  sistersMarried: number;
  familyLocation?: string;
  familyCity?: string;
  familyState?: string;
  houseType?: 'owned' | 'rented' | 'lease' | 'parents';
  aboutFamily?: string;
}

export interface Photo {
  id: string;
  userId: string;
  profileId: string;
  originalUrl: string;
  largeUrl?: string;
  mediumUrl?: string;
  thumbnailUrl?: string;
  watermarkUrl?: string;
  displayOrder: number;
  isPrimary: boolean;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  visibility: 'all' | 'contacts_only' | 'premium_only' | 'hidden';
  isProtected: boolean;
  createdAt: string;
}

export interface Horoscope {
  id: string;
  profileId: string;
  rashi?: string;
  nakshatra?: string;
  nakshatraPada?: number;
  gotra?: string;
  gothra?: string;
  manglik?: 'yes' | 'no' | 'anupooshan' | 'partial' | 'anshik';
  ashtaKoot?: number;
  dashakoot?: number;
  totalGun?: number;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  documentUrl?: string;
  documentStatus: 'pending' | 'approved' | 'rejected';
}

// Geo Types
export interface GeoLocation {
  id: string;
  locationType: 'country' | 'state' | 'district' | 'taluka' | 'village';
  name: string;
  nameLocal?: string;
  code?: string;
  isoCode?: string;
  parentId?: string;
  level: number;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  children?: GeoLocation[];
}

export interface Address {
  id: string;
  userId: string;
  profileId?: string;
  addressType: 'permanent' | 'current' | 'office' | 'ancestral' | 'other';
  isPrimary: boolean;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  locality?: string;
  pincode?: string;
  countryId?: string;
  stateId?: string;
  districtId?: string;
  talukaId?: string;
  villageId?: string;
  fullAddress?: string;
}

// Membership Types
export interface MembershipPlan {
  id: string;
  name: string;
  nameHi?: string;
  nameMr?: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  durationDays: number;
  durationLabel?: string;
  maxContactsPerDay?: number;
  maxContactsTotal?: number;
  maxMessagesPerDay?: number;
  maxPhotos: number;
  canViewContacts: boolean;
  canSendMessages: boolean;
  canVideoChat: boolean;
  canAddSocialLinks: boolean;
  isAdFree: boolean;
  isFeatured: boolean;
  isRecommended: boolean;
  isActive: boolean;
  benefits: string[];
  badgeText?: string;
  badgeColor?: string;
}

export interface UserMembership {
  id: string;
  userId: string;
  planId: string;
  plan?: MembershipPlan;
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'suspended' | 'trial';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  isTrial: boolean;
  contactsViewed: number;
  contactsViewedToday: number;
  messagesSent: number;
  createdAt: string;
}

// Interest Types
export type InterestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';

export interface Interest {
  id: string;
  senderId: string;
  receiverId: string;
  senderProfile?: Profile;
  receiverProfile?: Profile;
  status: InterestStatus;
  message?: string;
  sentVia: 'platform' | 'whatsapp' | 'franchise' | 'referral';
  createdAt: string;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  messageType: 'text' | 'image' | 'document' | 'voice' | 'template';
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  participant1Profile?: Profile;
  participant2Profile?: Profile;
  lastMessage?: Message;
  lastMessageAt?: string;
  participant1Unread: number;
  participant2Unread: number;
  createdAt: string;
}

// Match Types
export interface Match {
  profile: Profile;
  compatibilityScore: number;
  matchingCriteria: {
    education: boolean;
    occupation: boolean;
    location: boolean;
    religion: boolean;
    caste: boolean;
    income: boolean;
    age: boolean;
    height: boolean;
  };
  reason?: string;
}

// Search Types
export interface SearchFilters {
  gender?: 'male' | 'female';
  minAge?: number;
  maxAge?: number;
  minHeightCm?: number;
  maxHeightCm?: number;
  religion?: string[];
  caste?: string[];
  motherTongue?: string[];
  maritalStatus?: string[];
  country?: string[];
  state?: string[];
  city?: string[];
  highestEducation?: string[];
  occupation?: string[];
  employedIn?: string[];
  minIncome?: number;
  maxIncome?: number;
  diet?: string[];
  physicalStatus?: string[];
  manglik?: string[];
  kycVerified?: boolean;
  photoVerified?: boolean;
  isPremium?: boolean;
}

export interface SearchResult {
  profiles: Profile[];
  total: number;
  page: number;
  pageSize: number;
}

// Franchise Types
export interface FranchiseCentre {
  id: string;
  name: string;
  code: string;
  slug?: string;
  email: string;
  phone: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'closed';
  isVerified: boolean;
  commissionPercent: number;
  commissionType: 'revenue_share' | 'fixed_per_lead' | 'fixed_per_sale';
  subdomain?: string;
  totalMembers: number;
  totalRevenue: number;
  createdAt: string;
}

export interface FranchiseStaff {
  id: string;
  userId: string;
  user?: User;
  franchiseCentreId: string;
  franchiseCentre?: FranchiseCentre;
  staffCode?: string;
  designation?: string;
  permissions: Record<string, boolean>;
  isActive: boolean;
  canLogin: boolean;
}

// Appointment Types
export interface Appointment {
  id: string;
  userId: string;
  userProfile?: Profile;
  franchiseCentreId?: string;
  franchiseCentre?: FranchiseCentre;
  staffId?: string;
  staff?: User;
  appointmentType: 'video_kyc' | 'profile_setup' | 'consultation' | 'other';
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  meetingLink?: string;
  notes?: string;
  createdAt: string;
}

// Document Types
export interface Document {
  id: string;
  userId: string;
  profileId?: string;
  documentType: 'aadhaar' | 'pan' | 'passport' | 'voter_id' | 'driving_license' | 'address_proof';
  documentNumber?: string;
  frontUrl?: string;
  backUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  expiryDate?: string;
  createdAt: string;
}

// Vendor Types
export interface Vendor {
  id: string;
  name: string;
  category: string;
  description?: string;
  photos: string[];
  pricing?: string;
  location?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'interest' | 'message' | 'match' | 'system' | 'membership' | 'kyc';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ProfileCompletion {
  percentage: number;
  sections: {
    basic: boolean;
    photos: boolean;
    family: boolean;
    horoscope: boolean;
    partnerPreference: boolean;
    aboutMe: boolean;
  };
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  religion: string;
}

// CMS Types
export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuccessStory {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  location?: string;
  isFeatured: boolean;
  status: string;
  publishedAt?: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  avatarUrl?: string;
  isFeatured: boolean;
  createdAt: string;
}

// Marketplace Types
export interface MarketplaceVendor {
  id: string;
  businessName: string;
  slug: string;
  categoryId: string;
  description: string;
  longDescription?: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  priceRange: string;
  images: string[];
  services: string[];
  workingHours: { day: string; hours: string }[];
  createdAt: string;
}

export interface MarketplaceClassified {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  location: string;
  price: string;
  postedBy: string;
  phone: string;
  email?: string;
  images: string[];
  condition?: string;
  negotiable: boolean;
  isFeatured: boolean;
  views: number;
  favorites: number;
  createdAt: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  type: 'vendor' | 'classified';
  description?: string;
  icon?: string;
  parentId?: string;
  displayOrder: number;
}
