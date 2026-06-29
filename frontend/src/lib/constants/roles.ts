// ============================================================
// User Roles & Permissions
// ============================================================

export const UserRoles = {
  GUEST: 'guest',
  FREE_MEMBER: 'free_member',
  PAID_MEMBER: 'paid_member',
  CENTRE_STAFF: 'centre_staff',
  CENTRE_ADMIN: 'centre_admin',
  SUPER_ADMIN: 'super_admin'
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const RoleHierarchy: Record<UserRole, number> = {
  [UserRoles.GUEST]: 0,
  [UserRoles.FREE_MEMBER]: 1,
  [UserRoles.PAID_MEMBER]: 2,
  [UserRoles.CENTRE_STAFF]: 3,
  [UserRoles.CENTRE_ADMIN]: 4,
  [UserRoles.SUPER_ADMIN]: 5
};

export const RoleLabels: Record<UserRole, { en: string; hi: string; mr: string }> = {
  [UserRoles.GUEST]: { en: 'Guest', hi: 'अतिथि', mr: 'पाहुणे' },
  [UserRoles.FREE_MEMBER]: { en: 'Free Member', hi: 'निःशुल्क सदस्य', mr: 'विनामूल्य सदस्य' },
  [UserRoles.PAID_MEMBER]: { en: 'Premium Member', hi: 'प्रीमियम सदस्य', mr: 'प्रीमियम सदस्य' },
  [UserRoles.CENTRE_STAFF]: { en: 'Centre Staff', hi: 'केंद्र कर्मचारी', mr: 'केंद्र कर्मचारी' },
  [UserRoles.CENTRE_ADMIN]: { en: 'Centre Admin', hi: 'केंद्र प्रशासक', mr: 'केंद्र प्रशासक' },
  [UserRoles.SUPER_ADMIN]: { en: 'Super Admin', hi: 'सुपर एडमिन', mr: 'सुपर एडमिन' }
};

export const UserStatuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING_APPROVAL: 'pending_approval',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
} as const;

export type UserStatus = (typeof UserStatuses)[keyof typeof UserStatuses];

export const StatusLabels: Record<UserStatus, { en: string; hi: string; mr: string }> = {
  [UserStatuses.ACTIVE]: { en: 'Active', hi: 'सक्रिय', mr: 'सक्रिय' },
  [UserStatuses.INACTIVE]: { en: 'Inactive', hi: 'निष्क्रिय', mr: 'निष्क्रिय' },
  [UserStatuses.PENDING_APPROVAL]: { en: 'Pending Approval', hi: 'स्वीकृति प्रलंबित', mr: 'मंजूरी प्रलंबित' },
  [UserStatuses.SUSPENDED]: { en: 'Suspended', hi: 'निलंबित', mr: 'निलंबित' },
  [UserStatuses.BANNED]: { en: 'Banned', hi: 'प्रतिबंधित', mr: 'बंद' }
};

// Permission definitions
export const Permissions = {
  // Profile
  VIEW_OWN_PROFILE: 'view_own_profile',
  EDIT_OWN_PROFILE: 'edit_own_profile',
  VIEW_OTHER_PROFILES: 'view_other_profiles',
  VIEW_CONTACT_DETAILS: 'view_contact_details',
  SEND_INTEREST: 'send_interest',
  RECEIVE_INTEREST: 'receive_interest',
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  VIDEO_CHAT: 'video_chat',
  VIEW_SOCIAL_LINKS: 'view_social_links',
  UPLOAD_PHOTOS: 'upload_photos',
  ADD_HOROSCOPE: 'add_horoscope',

  // Membership
  UPGRADE_MEMBERSHIP: 'upgrade_membership',
  ACCESS_AD_FREE: 'access_ad_free',
  FEATURED_PROFILE: 'featured_profile',

  // Admin - Members
  ADMIN_VIEW_MEMBERS: 'admin_view_members',
  ADMIN_EDIT_MEMBERS: 'admin_edit_members',
  ADMIN_DELETE_MEMBERS: 'admin_delete_members',
  ADMIN_APPROVE_MEMBERS: 'admin_approve_members',
  ADMIN_BAN_MEMBERS: 'admin_ban_members',

  // Admin - Content
  ADMIN_MANAGE_CMS: 'admin_manage_cms',
  ADMIN_MANAGE_BANNERS: 'admin_manage_banners',
  ADMIN_MANAGE_CLASSIFIEDS: 'admin_manage_classifieds',
  ADMIN_MANAGE_SUCCESS_STORIES: 'admin_manage_success_stories',

  // Admin - Franchise
  ADMIN_MANAGE_FRANCHISES: 'admin_manage_franchises',
  ADMIN_VIEW_FRANCHISE_REPORTS: 'admin_view_franchise_reports',

  // Admin - Reports
  ADMIN_VIEW_REPORTS: 'admin_view_reports',
  ADMIN_EXPORT_DATA: 'admin_export_data',

  // Admin - Settings
  ADMIN_MANAGE_SETTINGS: 'admin_manage_settings',
  ADMIN_MANAGE_MEMBERSHIP_PLANS: 'admin_manage_membership_plans',
  ADMIN_MANAGE_GEO_DATA: 'admin_manage_geo_data',

  // Franchise
  FRANCHISE_VIEW_MEMBERS: 'franchise_view_members',
  FRANCHISE_ADD_MEMBERS: 'franchise_add_members',
  FRANCHISE_EDIT_MEMBERS: 'franchise_edit_members',
  FRANCHISE_MANAGE_APPOINTMENTS: 'franchise_manage_appointments',
  FRANCHISE_CONDUCT_KYC: 'franchise_conduct_kyc',
  FRANCHISE_VIEW_VENDORS: 'franchise_view_vendors',
  FRANCHISE_ADD_VENDORS: 'franchise_add_vendors',
  FRANCHISE_VIEW_REPORTS: 'franchise_view_reports',

  // Video KYC
  SCHEDULE_VIDEO_KYC: 'schedule_video_kyc',
  CONDUCT_VIDEO_KYC: 'conduct_video_kyc',
  APPROVE_VIDEO_KYC: 'approve_video_kyc'
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

// Role to Permissions mapping
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRoles.GUEST]: [
    Permissions.VIEW_OTHER_PROFILES
  ],
  [UserRoles.FREE_MEMBER]: [
    Permissions.VIEW_OWN_PROFILE,
    Permissions.EDIT_OWN_PROFILE,
    Permissions.VIEW_OTHER_PROFILES,
    Permissions.SEND_INTEREST,
    Permissions.RECEIVE_INTEREST,
    Permissions.SEND_MESSAGE,
    Permissions.RECEIVE_MESSAGE,
    Permissions.UPLOAD_PHOTOS,
    Permissions.ADD_HOROSCOPE,
    Permissions.SCHEDULE_VIDEO_KYC
  ],
  [UserRoles.PAID_MEMBER]: [
    Permissions.VIEW_OWN_PROFILE,
    Permissions.EDIT_OWN_PROFILE,
    Permissions.VIEW_OTHER_PROFILES,
    Permissions.VIEW_CONTACT_DETAILS,
    Permissions.SEND_INTEREST,
    Permissions.RECEIVE_INTEREST,
    Permissions.SEND_MESSAGE,
    Permissions.RECEIVE_MESSAGE,
    Permissions.VIDEO_CHAT,
    Permissions.VIEW_SOCIAL_LINKS,
    Permissions.UPLOAD_PHOTOS,
    Permissions.ADD_HOROSCOPE,
    Permissions.UPGRADE_MEMBERSHIP,
    Permissions.SCHEDULE_VIDEO_KYC
  ],
  [UserRoles.CENTRE_STAFF]: [
    Permissions.VIEW_OWN_PROFILE,
    Permissions.EDIT_OWN_PROFILE,
    Permissions.FRANCHISE_VIEW_MEMBERS,
    Permissions.FRANCHISE_ADD_MEMBERS,
    Permissions.FRANCHISE_EDIT_MEMBERS,
    Permissions.FRANCHISE_MANAGE_APPOINTMENTS,
    Permissions.FRANCHISE_CONDUCT_KYC,
    Permissions.FRANCHISE_VIEW_VENDORS
  ],
  [UserRoles.CENTRE_ADMIN]: [
    Permissions.VIEW_OWN_PROFILE,
    Permissions.EDIT_OWN_PROFILE,
    Permissions.FRANCHISE_VIEW_MEMBERS,
    Permissions.FRANCHISE_ADD_MEMBERS,
    Permissions.FRANCHISE_EDIT_MEMBERS,
    Permissions.FRANCHISE_MANAGE_APPOINTMENTS,
    Permissions.FRANCHISE_CONDUCT_KYC,
    Permissions.FRANCHISE_VIEW_VENDORS,
    Permissions.FRANCHISE_ADD_VENDORS,
    Permissions.FRANCHISE_VIEW_REPORTS,
    Permissions.VIEW_OTHER_PROFILES,
    Permissions.VIEW_CONTACT_DETAILS,
    Permissions.SEND_INTEREST,
    Permissions.SEND_MESSAGE
  ],
  [UserRoles.SUPER_ADMIN]: Object.values(Permissions) as Permission[]
};

// Helper functions
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return RolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function isAdminRole(role: UserRole): boolean {
  const adminRoles: UserRole[] = [UserRoles.CENTRE_ADMIN, UserRoles.CENTRE_STAFF, UserRoles.SUPER_ADMIN];
  return adminRoles.includes(role);
}

export function isMemberRole(role: UserRole): boolean {
  const memberRoles: UserRole[] = [UserRoles.FREE_MEMBER, UserRoles.PAID_MEMBER];
  return memberRoles.includes(role);
}

export function getRoleLevel(role: UserRole): number {
  return RoleHierarchy[role] ?? 0;
}
