// ============================================================
// Type Definitions - Backend
// ============================================================

// User Types
export type UserRole =
  | 'guest'
  | 'free_member'
  | 'paid_member'
  | 'centre_staff'
  | 'centre_admin'
  | 'franchise_admin'
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
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface AuthUser extends User {
  profile?: Profile;
  membership?: Membership;
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
  dateOfBirth: Date;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  complexion?: string;
  bodyType?: string;
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
  employedIn?: string;
  annualIncome?: number;
  workLocation?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  hobbies?: string[];
  aboutMe?: string;
  expectations?: string;
  partnerPreference?: PartnerPreference;
  maritalStatus: string;
  kycStatus: 'pending' | 'in_progress' | 'verified' | 'rejected';
  profileVisibility: string;
  photoVisibility: string;
  profileViews: number;
  interestsReceived: number;
  interestsSent: number;
  profileCompletionPercent: number;
  isFeatured: boolean;
  isPremium: boolean;
  isVerified: boolean;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
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

// Membership Types
export interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  durationDays: number;
  maxContactsPerDay?: number;
  canVideoChat: boolean;
  canAddSocialLinks: boolean;
  isAdFree: boolean;
  isFeatured: boolean;
  isActive: boolean;
  benefits: string[];
}

export interface Membership {
  id: string;
  userId: string;
  planId: string;
  plan?: MembershipPlan;
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'suspended';
  startDate: Date;
  endDate: Date;
  contactsViewed: number;
  messagesSent: number;
  createdAt: Date;
}

// Geo Types
export interface GeoLocation {
  id: string;
  locationType: 'country' | 'state' | 'district' | 'taluka' | 'village';
  name: string;
  nameLocal?: string;
  code?: string;
  parentId?: string;
  level: number;
  pincode?: string;
  isActive: boolean;
}

// Interest Types
export type InterestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';

export interface Interest {
  id: string;
  senderId: string;
  receiverId: string;
  status: InterestStatus;
  message?: string;
  sentVia: 'platform' | 'whatsapp' | 'franchise' | 'referral';
  createdAt: Date;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  messageType: 'text' | 'image' | 'document';
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// Franchise Types
export interface FranchiseCentre {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  addressLine?: string;
  city?: string;
  state?: string;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'closed';
  commissionPercent: number;
  totalMembers: number;
  createdAt: Date;
}

// Appointment Types
export type AppointmentType = 'video_kyc' | 'profile_setup' | 'consultation' | 'other';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  userId: string;
  franchiseCentreId?: string;
  staffId?: string;
  appointmentType: AppointmentType;
  scheduledDate: Date;
  scheduledTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  meetingLink?: string;
  notes?: string;
  createdAt: Date;
}

// Document Types
export type DocumentType = 'aadhaar' | 'pan' | 'passport' | 'voter_id' | 'driving_license' | 'address_proof';
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface Document {
  id: string;
  userId: string;
  profileId?: string;
  documentType: DocumentType;
  documentNumber?: string;
  frontUrl?: string;
  backUrl?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  expiryDate?: Date;
  createdAt: Date;
}

// Photo Types
export type PhotoApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Photo {
  id: string;
  userId: string;
  profileId: string;
  originalUrl: string;
  largeUrl?: string;
  mediumUrl?: string;
  thumbnailUrl?: string;
  displayOrder: number;
  isPrimary: boolean;
  isApproved: boolean;
  approvalStatus: PhotoApprovalStatus;
  visibility: string;
  isProtected: boolean;
  createdAt: Date;
}

// Family Info Types
export interface FamilyInfo {
  id: string;
  profileId: string;
  familyType?: string;
  familyStatus?: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherStatus?: string;
  motherName?: string;
  motherOccupation?: string;
  motherStatus?: string;
  brothersCount: number;
  sistersCount: number;
  brothersMarried: number;
  sistersMarried: number;
  familyLocation?: string;
  familyCity?: string;
  familyState?: string;
  aboutFamily?: string;
  createdAt: Date;
}

// Horoscope Types
export type ManglikStatus = 'yes' | 'no' | 'anupooshan' | 'partial' | 'anshik';

export interface Horoscope {
  id: string;
  profileId: string;
  rashi?: string;
  nakshatra?: string;
  nakshatraPada?: number;
  gotra?: string;
  gothra?: string;
  manglik?: ManglikStatus;
  ashtaKoot?: number;
  dashakoot?: number;
  totalGun?: number;
  birthDate?: Date;
  birthTime?: string;
  birthPlace?: string;
  documentUrl?: string;
  documentStatus: DocumentStatus;
  createdAt: Date;
}

// Notification Types
export type NotificationType = 'interest' | 'message' | 'match' | 'system' | 'membership' | 'kyc';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// Vendor Types
export type VendorStatus = 'pending' | 'approved' | 'rejected';

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
  status: VendorStatus;
  franchiseCentreId?: string;
  createdAt: Date;
}

// Payment Types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'paypal' | 'stripe' | 'offline';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  planId?: string;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  createdAt: Date;
}

// API Response Types
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
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Role Hierarchy
export const RoleHierarchy: Record<UserRole, number> = {
  guest: 0,
  free_member: 1,
  paid_member: 2,
  centre_staff: 3,
  centre_admin: 4,
  franchise_admin: 4,
  super_admin: 5
};

// Express Request extension is in middleware/auth.ts
