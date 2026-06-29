// ============================================================
// Membership Plans Configuration
// ============================================================

export const MembershipPlanSlugs = {
  FREE: 'free',
  SILVER: 'silver',
  GOLD: 'gold',
  PREMIUM: 'premium',
  DIAMOND: 'diamond'
} as const;

export type PlanSlug = (typeof MembershipPlanSlugs)[keyof typeof MembershipPlanSlugs];

export const PlanFeatures = {
  contactsPerDay: {
    free: 5,
    silver: 10,
    gold: 25,
    premium: 50,
    diamond: null // unlimited
  },
  maxPhotos: {
    free: 3,
    silver: 5,
    gold: 10,
    premium: 15,
    diamond: 20
  },
  videoChat: {
    free: false,
    silver: false,
    gold: true,
    premium: true,
    diamond: true
  },
  adFree: {
    free: false,
    silver: false,
    gold: true,
    premium: true,
    diamond: true
  },
  socialLinksVisible: {
    free: false,
    silver: true,
    gold: true,
    premium: true,
    diamond: true
  },
  priorityPlacement: {
    free: false,
    silver: false,
    gold: true,
    premium: true,
    diamond: true
  },
  horoscopeVisible: {
    free: false,
    silver: true,
    gold: true,
    premium: true,
    diamond: true
  },
  featuredBadge: {
    free: false,
    silver: false,
    gold: true,
    premium: true,
    diamond: true
  }
} as const;

export const PlanPrices = {
  [MembershipPlanSlugs.SILVER]: {
    inr: 999,
    usd: 15
  },
  [MembershipPlanSlugs.GOLD]: {
    inr: 2499,
    usd: 35
  },
  [MembershipPlanSlugs.PREMIUM]: {
    inr: 4999,
    usd: 65
  },
  [MembershipPlanSlugs.DIAMOND]: {
    inr: 9999,
    usd: 125
  }
} as const;

export const PlanDurations = {
  [MembershipPlanSlugs.SILVER]: 90, // 3 months
  [MembershipPlanSlugs.GOLD]: 180, // 6 months
  [MembershipPlanSlugs.PREMIUM]: 365, // 1 year
  [MembershipPlanSlugs.DIAMOND]: 365 // 1 year
} as const;

export const PrepaidPackTypes = {
  CONTACTS_10: 'contacts_10',
  CONTACTS_25: 'contacts_25',
  CONTACTS_50: 'contacts_50',
  MESSAGES_20: 'messages_20',
  MESSAGES_50: 'messages_50'
} as const;

export const PrepaidPackPrices = {
  [PrepaidPackTypes.CONTACTS_10]: { inr: 299, label: '10 Contacts' },
  [PrepaidPackTypes.CONTACTS_25]: { inr: 599, label: '25 Contacts' },
  [PrepaidPackTypes.CONTACTS_50]: { inr: 999, label: '50 Contacts' },
  [PrepaidPackTypes.MESSAGES_20]: { inr: 199, label: '20 Messages' },
  [PrepaidPackTypes.MESSAGES_50]: { inr: 399, label: '50 Messages' }
} as const;
