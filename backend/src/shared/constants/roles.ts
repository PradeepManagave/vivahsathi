// ============================================================
// Shared Constants - Roles and Permissions
// ============================================================

import { UserRole } from '../../types/index';

export const ADMIN_ROLES: UserRole[] = ['super_admin', 'centre_admin', 'franchise_admin'];

export const PAID_ROLES: UserRole[] = ['paid_member', 'centre_staff', 'centre_admin', 'super_admin'];

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function isPaidRole(role: UserRole): boolean {
  return PAID_ROLES.includes(role);
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  guest: [],
  free_member: [
    'view_profile',
    'edit_own_profile',
    'send_interest',
    'receive_interest',
    'send_message',
    'view_own_profile',
    'upload_photos',
    'manage_own_photos'
  ],
  paid_member: [
    'view_profile',
    'edit_own_profile',
    'send_interest',
    'receive_interest',
    'send_message',
    'receive_message',
    'view_own_profile',
    'upload_photos',
    'manage_own_photos',
    'video_chat',
    'view_contacts',
    'view_horoscope',
    'shortlist'
  ],
  centre_staff: [
    'view_profile',
    'edit_own_profile',
    'send_interest',
    'receive_interest',
    'send_message',
    'receive_message',
    'view_own_profile',
    'upload_photos',
    'manage_own_photos',
    'video_chat',
    'view_contacts',
    'view_horoscope',
    'shortlist',
    'view_centre_members',
    'conduct_kyc',
    'manage_appointments',
    'view_centre_reports'
  ],
  centre_admin: [
    'view_profile',
    'edit_own_profile',
    'send_interest',
    'receive_interest',
    'send_message',
    'receive_message',
    'view_own_profile',
    'upload_photos',
    'manage_own_photos',
    'video_chat',
    'view_contacts',
    'view_horoscope',
    'shortlist',
    'view_centre_members',
    'conduct_kyc',
    'manage_appointments',
    'view_centre_reports',
    'manage_centre_members',
    'approve_photos',
    'view_vendor_reports',
    'manage_vendors'
  ],
  franchise_admin: [
    'view_profile',
    'edit_own_profile',
    'send_interest',
    'receive_interest',
    'send_message',
    'receive_message',
    'view_own_profile',
    'upload_photos',
    'manage_own_photos',
    'video_chat',
    'view_contacts',
    'view_horoscope',
    'shortlist',
    'view_centre_members',
    'conduct_kyc',
    'manage_appointments',
    'view_centre_reports',
    'manage_centre_members',
    'approve_photos',
    'view_vendor_reports',
    'manage_vendors',
    'manage_centres'
  ],
  super_admin: ['*']
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes('*') || permissions.includes(permission);
}

export function hasAnyPermission(role: UserRole, requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => hasPermission(role, permission));
}

export function hasAllPermissions(role: UserRole, requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(role, permission));
}
