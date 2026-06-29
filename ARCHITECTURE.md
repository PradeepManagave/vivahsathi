# M-Plus Matrimony Platform — Architecture Document

**Version:** 1.0  
**Status:** Architecture Specification  
**Date:** 2026-03-26

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Frontend Folder Structure (Next.js)](#2-frontend-folder-structure-nextjs)
3. [Backend Folder Structure (Node.js/Express)](#3-backend-folder-structure-nodejsexpress)
4. [API Naming Conventions](#4-api-naming-conventions)
5. [Database Schema Overview](#5-database-schema-overview)
6. [Environment Variables](#6-environment-variables)
7. [Third-Party Integrations](#7-third-party-integrations)

---

## 1. Project Overview

### Platform Type
Enterprise Multi-Centre Franchise Matrimony SaaS

### Target Markets
- Primary: India (Marathi, Hindi-speaking communities)
- Secondary: International (NRI members)

### User Roles (6 Tiers)
| Level | Role | Description |
|-------|------|-------------|
| 1 | Site Super Admin | Full platform control |
| 2 | Franchise Centre Admin | Regional management |
| 3 | Franchise Centre Staff | Assisted registration |
| 4 | Paid Member | Unlimited access |
| 5 | Free Member | Limited access + ads |
| 6 | Guest | Browse-only access |

### Supported Languages
- Marathi, Hindi, English + configurable regional languages

---

## 2. Frontend Folder Structure (Next.js)

```
m-plus-matrimony/
├── .env.local                      # Local environment variables
├── .env.production                 # Production environment variables
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind CSS with design tokens
├── tsconfig.json                   # TypeScript configuration
├── package.json
├── public/                         # Static assets
│   ├── images/
│   │   ├── logos/
│   │   ├── backgrounds/
│   │   └── placeholders/
│   ├── icons/
│   └── fonts/
│
├── src/
│   ├── app/                        # Next.js App Router (pages)
│   │   │
│   │   ├── (auth)/                # Auth routes (login, register, forgot-password)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-email/
│   │   │   ├── verify-phone/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (member)/              # Member routes (authenticated)
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   │   ├── edit/
│   │   │   │   ├── photos/
│   │   │   │   ├── family/
│   │   │   │   ├── horoscope/
│   │   │   │   └── partner-preference/
│   │   │   ├── matches/
│   │   │   ├── search/
│   │   │   ├── inbox/
│   │   │   │   ├── requests/
│   │   │   │   ├── messages/
│   │   │   │   └── sent/
│   │   │   ├── video-kyc/
│   │   │   ├── video-chat/
│   │   │   ├── membership/
│   │   │   ├── settings/
│   │   │   └── help/
│   │   │
│   │   ├── (guest)/               # Public routes (unauthenticated)
│   │   │   ├── home/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── faq/
│   │   │   ├── privacy-policy/
│   │   │   ├── terms/
│   │   │   └── success-stories/
│   │   │
│   │   ├── profile/[username]/    # Public profile pages (SEO-friendly)
│   │   │
│   │   ├── search/                # Public search results
│   │   │
│   │   ├── (admin)/               # Admin routes
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── members/
│   │   │   │   ├── franchise/
│   │   │   │   ├── reports/
│   │   │   │   ├── cms/
│   │   │   │   ├── geo-data/
│   │   │   │   ├── payments/
│   │   │   │   ├── settings/
│   │   │   │   └── logs/
│   │   │   │
│   │   │   ├── franchise/         # Franchise Centre Admin
│   │   │   │   ├── dashboard/
│   │   │   │   ├── members/
│   │   │   │   ├── appointments/
│   │   │   │   ├── staff/
│   │   │   │   ├── vendors/
│   │   │   │   └── reports/
│   │   │   │
│   │   │   └── staff/             # Franchise Centre Staff
│   │   │       ├── dashboard/
│   │   │       ├── registrations/
│   │   │       └── appointments/
│   │   │
│   │   ├── marketplace/           # Wedding Services Marketplace
│   │   │   ├── vendors/
│   │   │   ├── categories/
│   │   │   └── classifieds/
│   │   │
│   │   ├── api/                   # API routes (if using Next.js API)
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   │
│   ├── components/                 # Shared React components
│   │   │
│   │   ├── common/                # Generic UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── Avatar/
│   │   │   ├── Badge/
│   │   │   ├── Toast/
│   │   │   ├── Spinner/
│   │   │   ├── Dropdown/
│   │   │   ├── Tabs/
│   │   │   ├── Pagination/
│   │   │   ├── Rating/
│   │   │   └── Skeleton/
│   │   │
│   │   ├── forms/                  # Form components
│   │   │   ├── RegistrationForm/
│   │   │   ├── ProfileForm/
│   │   │   ├── SearchForm/
│   │   │   ├── HoroscopeForm/
│   │   │   ├── AddressForm/
│   │   │   └── GeoDropdown/
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   ├── MobileNav/
│   │   │   ├── TopBar/
│   │   │   └── AdminLayout/
│   │   │
│   │   ├── profile/               # Profile-related components
│   │   │   ├── ProfileCard/
│   │   │   ├── ProfileGrid/
│   │   │   ├── ProfileHeader/
│   │   │   ├── PhotoGallery/
│   │   │   ├── HoroscopeCard/
│   │   │   ├── FamilyInfo/
│   │   │   ├── PartnerPreferences/
│   │   │   ├── CompatibilityScore/
│   │   │   ├── VerifyBadge/
│   │   │   └── WhatsAppShare/
│   │   │
│   │   ├── search/                # Search components
│   │   │   ├── QuickSearch/
│   │   │   ├── AdvancedSearch/
│   │   │   ├── SearchFilters/
│   │   │   ├── SearchResults/
│   │   │   └── SavedSearches/
│   │   │
│   │   ├── match/                 # Match-related components
│   │   │   ├── MatchCard/
│   │   │   ├── MatchList/
│   │   │   ├── CompatibilityMeter/
│   │   │   └── MatchFilters/
│   │   │
│   │   ├── chat/                  # Messaging/Chat components
│   │   │   ├── ChatWindow/
│   │   │   ├── MessageBubble/
│   │   │   ├── ChatList/
│   │   │   ├── InterestRequest/
│   │   │   └── VideoCall/
│   │   │
│   │   ├── admin/                 # Admin-specific components
│   │   │   ├── DataTable/
│   │   │   ├── MemberApproval/
│   │   │   ├── PhotoReview/
│   │   │   ├── DocumentViewer/
│   │   │   ├── ReportChart/
│   │   │   ├── BannerManager/
│   │   │   └── GeoDataEditor/
│   │   │
│   │   ├── marketplace/           # Marketplace components
│   │   │   ├── VendorCard/
│   │   │   ├── VendorDetail/
│   │   │   ├── CategoryGrid/
│   │   │   ├── ReviewList/
│   │   │   └── InquiryForm/
│   │   │
│   │   └── ads/                   # Advertisement components
│   │       ├── AdSenseSlot/
│   │       ├── BannerAd/
│   │       └── AdManager/
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   ├── useProfile.ts
│   │   ├── useSearch.ts
│   │   ├── useMatches.ts
│   │   ├── useChat.ts
│   │   ├── useVideoCall.ts
│   │   ├── useGeoDropdown.ts
│   │   ├── useTranslation.ts
│   │   └── useToast.ts
│   │
│   ├── lib/                        # Utilities and helpers
│   │   ├── api/                   # API client functions
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   └── interceptors.ts
│   │   │
│   │   ├── utils/                 # Utility functions
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── config.ts
│   │   │   └── mappings.ts
│   │   │
│   │   └── validators/
│   │       └── schemas.ts
│   │
│   ├── stores/                     # State management (Zustand/Redux)
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── profileStore.ts
│   │   ├── searchStore.ts
│   │   ├── notificationStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── services/                   # Business logic services
│   │   ├── authService.ts
│   │   ├── profileService.ts
│   │   ├── searchService.ts
│   │   ├── matchService.ts
│   │   ├── paymentService.ts
│   │   └── notificationService.ts
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── user.types.ts
│   │   ├── profile.types.ts
│   │   ├── membership.types.ts
│   │   ├── franchise.types.ts
│   │   ├── geo.types.ts
│   │   ├── search.types.ts
│   │   ├── match.types.ts
│   │   ├── chat.types.ts
│   │   ├── api.types.ts
│   │   └── index.ts
│   │
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── LanguageContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── ToastContext.tsx
│   │
│   ├── i18n/                       # Internationalization
│   │   ├── locales/
│   │   │   ├── en/
│   │   │   │   ├── common.json
│   │   │   │   ├── auth.json
│   │   │   │   ├── profile.json
│   │   │   │   ├── search.json
│   │   │   │   └── admin.json
│   │   │   ├── hi/
│   │   │   └── mr/
│   │   │
│   │   └── i18n.ts
│   │
│   └── styles/                     # Global styles
│       ├── globals.css
│       └── themes/
│
├── storybook/                       # Component documentation
│   ├── stories/
│   └── .storybookrc
│
└── tests/                           # Test files (co-located)
    ├── unit/
    ├── integration/
    └── e2e/
```

### Frontend Directory Naming Conventions

| Directory | Purpose | Naming Pattern |
|-----------|---------|----------------|
| `app/` | Pages (App Router) | kebab-case: `profile-edit`, `my-matches` |
| `components/` | Reusable components | PascalCase: `ProfileCard`, `GeoDropdown` |
| `hooks/` | Custom hooks | camelCase with `use` prefix: `useAuth`, `useSearch` |
| `stores/` | State management | camelCase with `Store` suffix: `authStore` |
| `services/` | API/business logic | camelCase with `Service` suffix: `profileService` |
| `types/` | TypeScript types | kebab-case files: `profile.types.ts` |
| `lib/` | Utilities | kebab-case: `formatters.ts`, `validators.ts` |

---

## 3. Backend Folder Structure (Node.js/Express)

```
m-plus-api/
├── .env.example                     # Environment template
├── .env.development
├── .env.production
├── tsconfig.json
├── package.json
├── tsconfig.build.json
├── nodemon.json
├── jest.config.js
├── docker-compose.yml
│
├── src/
│   │
│   ├── app.ts                      # Express app setup
│   ├── server.ts                   # Server entry point
│   ├── config/                     # Configuration files
│   │   ├── index.ts                # Main config loader
│   │   ├── database.ts             # Database configuration
│   │   ├── redis.ts                # Redis configuration
│   │   ├── elasticsearch.ts        # Elasticsearch config
│   │   ├── email.ts                # Email/SMTP config
│   │   ├── sms.ts                  # SMS gateway config
│   │   ├── payment.ts              # Payment gateway config
│   │   └── storage.ts               # S3/CDN config
│   │
│   ├── modules/                    # Feature modules (DDD-style)
│   │   │
│   │   ├── auth/                   # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.middleware.ts
│   │   │   ├── auth.validator.ts
│   │   │   ├── auth.types.ts
│   │   │   └── __tests__/
│   │   │       ├── auth.controller.test.ts
│   │   │       └── auth.service.test.ts
│   │   │
│   │   ├── users/                  # User management module
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.router.ts
│   │   │   ├── users.middleware.ts
│   │   │   ├── users.validator.ts
│   │   │   ├── users.types.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── profiles/               # Profile management module
│   │   │   ├── profiles.controller.ts
│   │   │   ├── profiles.service.ts
│   │   │   ├── profiles.router.ts
│   │   │   ├── profiles.middleware.ts
│   │   │   ├── profiles.validator.ts
│   │   │   ├── profiles.types.ts
│   │   │   ├── profiles.repository.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── membership/             # Membership/plans module
│   │   │   ├── membership.controller.ts
│   │   │   ├── membership.service.ts
│   │   │   ├── membership.router.ts
│   │   │   ├── membership.middleware.ts
│   │   │   ├── membership.validator.ts
│   │   │   ├── membership.types.ts
│   │   │   ├── plans.controller.ts
│   │   │   ├── plans.service.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── search/                 # Search module
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   ├── search.router.ts
│   │   │   ├── search.validator.ts
│   │   │   ├── search.types.ts
│   │   │   ├── search.repository.ts  # Elasticsearch queries
│   │   │   └── __tests__/
│   │   │
│   │   ├── matches/                # Match recommendations
│   │   │   ├── matches.controller.ts
│   │   │   ├── matches.service.ts
│   │   │   ├── matches.router.ts
│   │   │   ├── matches.validator.ts
│   │   │   ├── matches.types.ts
│   │   │   ├── matchingAlgorithm.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── messaging/              # Chat/Messaging module
│   │   │   ├── messaging.controller.ts
│   │   │   ├── messaging.service.ts
│   │   │   ├── messaging.router.ts
│   │   │   ├── messaging.middleware.ts
│   │   │   ├── messaging.types.ts
│   │   │   ├── interest.controller.ts
│   │   │   ├── interest.service.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── video/                 # Video KYC & Chat module
│   │   │   ├── video.controller.ts
│   │   │   ├── video.service.ts
│   │   │   ├── video.router.ts
│   │   │   ├── video.middleware.ts
│   │   │   ├── video.types.ts
│   │   │   ├── kyc.service.ts
│   │   │   ├── webrtc.service.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── geo/                    # Geo-data management
│   │   │   ├── geo.controller.ts
│   │   │   ├── geo.service.ts
│   │   │   ├── geo.router.ts
│   │   │   ├── geo.validator.ts
│   │   │   ├── geo.types.ts
│   │   │   ├── geo.repository.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── franchise/              # Franchise Centre module
│   │   │   ├── franchise.controller.ts
│   │   │   ├── franchise.service.ts
│   │   │   ├── franchise.router.ts
│   │   │   ├── franchise.middleware.ts
│   │   │   ├── franchise.validator.ts
│   │   │   ├── franchise.types.ts
│   │   │   ├── staff.controller.ts
│   │   │   ├── staff.service.ts
│   │   │   ├── appointments.controller.ts
│   │   │   ├── appointments.service.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── payments/               # Payment/Billing module
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── payments.router.ts
│   │   │   ├── payments.validator.ts
│   │   │   ├── payments.types.ts
│   │   │   ├── razorpay.service.ts
│   │   │   ├── paypal.service.ts
│   │   │   ├── invoice.service.ts
│   │   │   ├── refund.service.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── notifications/         # Notifications module
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.router.ts
│   │   │   ├── notifications.types.ts
│   │   │   ├── email.service.ts
│   │   │   ├── sms.service.ts
│   │   │   ├── push.service.ts
│   │   │   ├── whatsapp.service.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── documents/             # Document upload/verification
│   │   │   ├── documents.controller.ts
│   │   │   ├── documents.service.ts
│   │   │   ├── documents.router.ts
│   │   │   ├── documents.types.ts
│   │   │   ├── storage.service.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── admin/                 # Admin operations
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.router.ts
│   │   │   ├── admin.types.ts
│   │   │   ├── cms.controller.ts
│   │   │   ├── cms.service.ts
│   │   │   ├── reports.controller.ts
│   │   │   ├── reports.service.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── marketplace/           # Wedding marketplace
│   │   │   ├── marketplace.controller.ts
│   │   │   ├── marketplace.service.ts
│   │   │   ├── marketplace.router.ts
│   │   │   ├── marketplace.types.ts
│   │   │   ├── vendor.service.ts
│   │   │   ├── classifieds.controller.ts
│   │   │   ├── classifieds.service.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── reports/               # Reporting module
│   │   │   ├── reports.controller.ts
│   │   │   ├── reports.service.ts
│   │   │   ├── reports.router.ts
│   │   │   ├── reports.types.ts
│   │   │   ├── memberReports.service.ts
│   │   │   ├── financialReports.service.ts
│   │   │   └── __tests__/
│   │   │
│   │   └── cms/                   # CMS module
│   │       ├── cms.controller.ts
│   │       ├── cms.service.ts
│   │       ├── cms.router.ts
│   │       ├── cms.types.ts
│   │       ├── banner.controller.ts
│   │       ├── banner.service.ts
│   │       └── __tests__/
│   │
│   ├── shared/                    # Shared resources across modules
│   │   │
│   │   ├── controllers/           # Base controllers
│   │   │   ├── base.controller.ts
│   │   │   └── admin.controller.ts
│   │   │
│   │   ├── services/              # Shared services
│   │   │   ├── cache.service.ts
│   │   │   ├── queue.service.ts
│   │   │   └── logger.service.ts
│   │   │
│   │   ├── middleware/            # Shared middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── logging.middleware.ts
│   │   │   ├── cors.middleware.ts
│   │   │   └── upload.middleware.ts
│   │   │
│   │   ├── validators/           # Shared validators
│   │   │   ├── Joi.schemas.ts
│   │   │   └── custom.validators.ts
│   │   │
│   │   ├── filters/              # Exception filters
│   │   │   ├── http-exception.filter.ts
│   │   │   └── validation.filter.ts
│   │   │
│   │   ├── decorators/           # Custom decorators
│   │   │   ├── roles.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   ├── throttle.decorator.ts
│   │   │   └── currentUser.decorator.ts
│   │   │
│   │   ├── utils/                # Shared utilities
│   │   │   ├── response.ts
│   │   │   ├── pagination.ts
│   │   │   ├── date.utils.ts
│   │   │   └── crypto.utils.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── roles.ts
│   │   │   ├── status.ts
│   │   │   ├── membershipplans.ts
│   │   │   └── errors.ts
│   │   │
│   │   └── types/
│   │       ├── request.ts
│   │       ├── response.ts
│   │       └── pagination.ts
│   │
│   ├── database/                  # Database setup
│   │   ├── index.ts               # Database connection
│   │   ├── migrations/            # TypeORM/Sequelize migrations
│   │   │   ├── 001_initial_schema.ts
│   │   │   ├── 002_add_geo_tables.ts
│   │   │   └── ...
│   │   │
│   │   ├── seeders/               # Database seeders
│   │   │   ├── geo.seeder.ts
│   │   │   ├── plans.seeder.ts
│   │   │   └── ...
│   │   │
│   │   └── entities/              # TypeORM entities
│   │       ├── user.entity.ts
│   │       ├── profile.entity.ts
│   │       ├── membership.entity.ts
│   │       ├── franchise.entity.ts
│   │       ├── geo.entity.ts
│   │       └── ...
│   │
│   ├── redis/                     # Redis setup
│   │   ├── index.ts
│   │   ├── session.store.ts
│   │   ├── cache.keys.ts
│   │   └── rate.limit.ts
│   │
│   ├── elasticsearch/             # Elasticsearch setup
│   │   ├── index.ts
│   │   ├── mappings/
│   │   │   └── profile.mapping.ts
│   │   └── queries/
│   │       ├── search.query.ts
│   │       └── match.query.ts
│   │
│   ├── jobs/                      # Background jobs (Bull/BullMQ)
│   │   ├── index.ts
│   │   ├── queues/
│   │   │   ├── email.queue.ts
│   │   │   ├── sms.queue.ts
│   │   │   └── notification.queue.ts
│   │   │
│   │   └── processors/
│   │       ├── expiryReminder.processor.ts
│   │       ├── cleanup.processor.ts
│   │       └── matchScore.processor.ts
│   │
│   ├── websocket/                 # WebSocket setup (Socket.io)
│   │   ├── index.ts
│   │   ├── chat.socket.ts
│   │   ├── video.socket.ts
│   │   └── notifications.socket.ts
│   │
│   ├── cron/                      # Cron jobs
│   │   ├── index.ts
│   │   └── tasks/
│   │       ├── membershipExpiry.ts
│   │       ├── dailyMatchUpdate.ts
│   │       └── dataCleanup.ts
│   │
│   └── utils/                    # Root-level utilities
│       ├── logger.ts
│       └── helpers.ts
│
└── tests/                        # Test files
    ├── unit/
    ├── integration/
    ├── fixtures/
    └── mocks/
```

### Backend Module Structure Pattern

Each module follows consistent pattern:

```
module-name/
├── module.controller.ts     # HTTP request handlers
├── module.service.ts        # Business logic
├── module.router.ts         # Route definitions
├── module.middleware.ts     # Module-specific middleware
├── module.validator.ts      # Request validation
├── module.types.ts          # Type definitions
├── module.repository.ts      # Data access layer (if separate)
└── __tests__/
    ├── module.controller.test.ts
    └── module.service.test.ts
```

---

## 4. API Naming Conventions

### 4.1 URL Structure

```
/api/{version}/{resource}/{action}

/api/v1/auth/login
/api/v1/auth/register
/api/v1/users/profile
/api/v1/profiles/search
/api/v1/matches/daily
```

### 4.2 RESTful Endpoint Conventions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/logout` | User logout |
| POST | `/auth/forgot-password` | Password reset request |
| POST | `/auth/reset-password` | Password reset |
| POST | `/auth/refresh-token` | Refresh JWT token |
| GET | `/users/me` | Get current user |
| PATCH | `/users/me` | Update current user |
| GET | `/users/:id` | Get user by ID |
| GET | `/profiles` | List profiles (search) |
| POST | `/profiles` | Create profile |
| GET | `/profiles/:id` | Get profile by ID |
| PATCH | `/profiles/:id` | Update profile |
| DELETE | `/profiles/:id` | Delete profile |
| GET | `/matches` | Get matches |
| POST | `/matches/:id/accept` | Accept match |
| POST | `/matches/:id/reject` | Reject match |
| GET | `/messages` | Get messages |
| POST | `/messages` | Send message |
| POST | `/payments/initiate` | Start payment |
| POST | `/payments/webhook` | Payment gateway webhook |
| GET | `/admin/members` | Admin: List all members |
| PATCH | `/admin/members/:id/approve` | Admin: Approve member |
| POST | `/admin/franchises` | Admin: Create franchise |

### 4.3 API Versioning

- Version in URL path: `/api/v1/`, `/api/v2/`
- Maintain backward compatibility within major versions
- Deprecation notices in response headers

### 4.4 Naming Rules

| Category | Convention | Example |
|----------|------------|---------|
| URL Path | kebab-case, plural nouns | `/user-profiles`, `/match-requests` |
| Query Parameters | snake_case | `profile_id`, `page_size` |
| Request Body | camelCase | `{ profileId, firstName }` |
| Response Body | camelCase | `{ profileId, firstName }` |
| Headers | kebab-case | `x-request-id`, `content-type` |

### 4.5 Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "timestamp": "2026-03-26T10:00:00Z"
}
```

### 4.6 Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (delete success) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 5. Database Schema Overview

### 5.1 Entity Relationship Diagram Overview

```
users ──────────────── profiles (1:1)
  │                       │
  │                       └── family_info (1:1)
  │                       └── partner_preferences (1:1)
  │                       └── photos (1:N)
  │                       └── horoscope (1:1)
  │                       └── documents (1:N)
  │
  ├── memberships (1:N)
  │       └── plans (1:N)
  │
  ├── addresses (1:N)
  │       └── geo_data (FK)
  │
  ├── interests_sent (1:N) ──────────── interests_received (FK)
  │
  ├── messages_sent (1:N) ──────────── messages_received (FK)
  │
  ├── social_links (1:N)
  │
  ├── activity_logs (1:N)
  │
  └── franchise_centres (1:N, as staff)
          │
          ├── staff (1:N)
          ├── appointments (1:N)
          └── commissions (1:N)

franchise_centres (1:N) ──── geo_data (FK: region)
```

### 5.2 Core Table Definitions

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    phone_country_code VARCHAR(5) DEFAULT '+91',
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'free_member', -- guest, free_member, paid_member, staff, franchise_admin, super_admin
    status VARCHAR(20) NOT NULL DEFAULT 'inactive', -- inactive, active, suspended, banned
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    last_active_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

#### profiles
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Info
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL, -- SEO-friendly URL slug
    display_name VARCHAR(100),
    
    -- Demographics
    gender VARCHAR(10) NOT NULL,
    date_of_birth DATE NOT NULL,
    age INTEGER,
    height_cm INTEGER,
    weight_kg INTEGER,
    complexion VARCHAR(20),
    physical_status VARCHAR(20), -- normal, disabled
    
    -- Religion & Community
    religion VARCHAR(50) NOT NULL,
    caste VARCHAR(100),
    sub_caste VARCHAR(100),
    mother_tongue VARCHAR(50),
    gothra VARCHAR(100),
    
    -- Education & Career
    highest_education VARCHAR(100),
    education_details VARCHAR(255),
    occupation VARCHAR(100),
    occupation_details VARCHAR(255),
    annual_income DECIMAL(12,2),
    work_location VARCHAR(255),
    employed_in VARCHAR(20), -- private, government, business, self_employed
    
    -- Lifestyle
    diet VARCHAR(20), -- veg, non_veg, vegan, Jain
    smoking VARCHAR(20), -- never, occasionally, regularly
    drinking VARCHAR(20), -- never, occasionally, regularly
    hobbies TEXT[],
    
    -- Appearance
    body_type VARCHAR(20), -- slim, average, athletic, heavy
    
    -- Bio
    about_me TEXT,
    bio TEXT,
    
    -- Profile Visibility
    profile_visibility VARCHAR(20) DEFAULT 'all', -- all, contacts_only, hidden
    photo_visibility VARCHAR(20) DEFAULT 'all',
    
    -- Verification Status
    kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, verified, rejected
    kyc_verified_at TIMESTAMP,
    kyc_verified_by UUID REFERENCES users(id),
    
    -- Profile Stats
    profile_views INTEGER DEFAULT 0,
    interest_received INTEGER DEFAULT 0,
    interest_sent INTEGER DEFAULT 0,
    
    -- Completion
    profile_completion_score INTEGER DEFAULT 0,
    
    -- Settings
    preferred_language VARCHAR(10) DEFAULT 'en',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_religion ON profiles(religion);
CREATE INDEX idx_profiles_caste ON profiles(caste);
CREATE INDEX idx_profiles_city ON profiles(work_location);
CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX idx_profiles_username ON profiles(username);
```

#### memberships
```sql
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES membership_plans(id),
    
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, expired, cancelled, suspended
    
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    
    -- Limits based on plan
    contacts_viewed INTEGER DEFAULT 0,
    contacts_limit INTEGER,
    messages_sent INTEGER DEFAULT 0,
    messages_limit INTEGER,
    
    -- Payment Reference
    payment_id UUID REFERENCES payments(id),
    
    -- Source
    franchise_centre_id UUID REFERENCES franchise_centres(id),
    enrolled_by UUID REFERENCES users(id), -- staff who enrolled
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_plan ON memberships(plan_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_end_date ON memberships(end_date);
```

#### membership_plans
```sql
CREATE TABLE membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    gst_rate DECIMAL(5,2) DEFAULT 18.00,
    
    -- Duration
    duration_days INTEGER NOT NULL,
    
    -- Features
    features JSONB NOT NULL, -- { contacts_per_day: 10, video_chat: true, ads: false }
    contact_view_limit INTEGER, -- per day or total
    daily_contact_limit INTEGER,
    message_limit INTEGER,
    can_video_chat BOOLEAN DEFAULT FALSE,
    show_ads BOOLEAN DEFAULT TRUE,
    priority_placement BOOLEAN DEFAULT FALSE,
    social_links_visible BOOLEAN DEFAULT FALSE,
    
    -- Limits
    max_photos INTEGER DEFAULT 5,
    max_horoscopes INTEGER DEFAULT 3,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trial BOOLEAN DEFAULT FALSE,
    
    -- Settings
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### franchise_centres
```sql
CREATE TABLE franchise_centres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    
    -- Contact
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    
    -- Address (links to geo_data)
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    village_id UUID REFERENCES geo_villages(id),
    taluka_id UUID REFERENCES geo_talukas(id),
    district_id UUID REFERENCES geo_districts(id),
    state_id UUID REFERENCES geo_states(id),
    country_id UUID REFERENCES geo_countries(id),
    pincode VARCHAR(10),
    
    -- Branding
    logo_url VARCHAR(500),
    primary_color VARCHAR(7),
    
    -- Business
    registration_number VARCHAR(50),
    gstin VARCHAR(15),
    
    -- Commission
    commission_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    commission_type VARCHAR(20) DEFAULT 'revenue_share', -- revenue_share, fixed_per_lead
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Admin Account (links to users)
    admin_user_id UUID UNIQUE REFERENCES users(id),
    
    -- Subdomain
    subdomain VARCHAR(100) UNIQUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_franchise_name ON franchise_centres(name);
CREATE INDEX idx_franchise_state ON franchise_centres(state_id);
CREATE INDEX idx_franchise_district ON franchise_centres(district_id);
```

#### geo_data (Hierarchical Location Tables)

```sql
-- Countries
CREATE TABLE geo_countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_local VARCHAR(100),
    iso_code VARCHAR(3),
    phone_code VARCHAR(5),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- States (Rajya)
CREATE TABLE geo_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID REFERENCES geo_countries(id),
    name VARCHAR(100) NOT NULL,
    name_local VARCHAR(100),
    code VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- Districts (Jilla)
CREATE TABLE geo_districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID REFERENCES geo_states(id),
    name VARCHAR(100) NOT NULL,
    name_local VARCHAR(100),
    code VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- Talukas
CREATE TABLE geo_talukas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES geo_districts(id),
    name VARCHAR(100) NOT NULL,
    name_local VARCHAR(100),
    code VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- Villages/Towns
CREATE TABLE geo_villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    taluka_id UUID REFERENCES geo_talukas(id),
    name VARCHAR(150) NOT NULL,
    name_local VARCHAR(150),
    pincode VARCHAR(10),
    village_type VARCHAR(20) DEFAULT 'town', -- village, town, city
    is_approved BOOLEAN DEFAULT TRUE, -- user-submitted need approval
    submitted_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_geo_state_country ON geo_states(country_id);
CREATE INDEX idx_geo_district_state ON geo_districts(state_id);
CREATE INDEX idx_geo_taluka_district ON geo_talukas(district_id);
CREATE INDEX idx_geo_village_taluka ON geo_villages(taluka_id);
CREATE INDEX idx_geo_village_pincode ON geo_villages(pincode);
```

### 5.3 Supporting Tables

#### photos
```sql
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    watermark_url VARCHAR(500),
    
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    is_protected BOOLEAN DEFAULT FALSE, -- hidden until contact
    visibility VARCHAR(20) DEFAULT 'all', -- all, contacts_only, hidden
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### family_info
```sql
CREATE TABLE family_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    family_type VARCHAR(20), -- nuclear, joint, extended
    family_status VARCHAR(50), -- middle_class, upper_middle, affluent
    
    father_name VARCHAR(100),
    father_occupation VARCHAR(100),
    father_status VARCHAR(20), -- alive, deceased
    
    mother_name VARCHAR(100),
    mother_occupation VARCHAR(100),
    mother_status VARCHAR(20), -- alive, deceased
    
    siblings_brothers INTEGER,
    siblings_brothers_married INTEGER,
    siblings_sisters INTEGER,
    siblings_sisters_married INTEGER,
    
    family_location TEXT,
    family_city VARCHAR(100),
    family_state VARCHAR(100),
    
    about_family TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### horoscopes
```sql
CREATE TABLE horoscopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    rashi VARCHAR(50),
    nakshatra VARCHAR(50),
    nakshatra_pada INTEGER,
    gotra VARCHAR(100),
    gothra VARCHAR(100),
    
    manglik VARCHAR(20), -- yes, no, anshik
    surya_siddhanta BOOLEAN DEFAULT TRUE,
    
    birth_date DATE,
    birth_time TIME,
    birth_place VARCHAR(255),
    
    -- Kundali/Milan scores
    ashta_koot INTEGER,
    dashakoot INTEGER,
    
    document_url VARCHAR(500),
    document_status VARCHAR(20) DEFAULT 'pending',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### partner_preferences
```sql
CREATE TABLE partner_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Age
    min_age INTEGER,
    max_age INTEGER,
    
    -- Height
    min_height_cm INTEGER,
    max_height_cm INTEGER,
    
    -- Religion & Community
    preferred_religions VARCHAR(50)[],
    preferred_castes VARCHAR(100)[],
    mother_tongue VARCHAR(50)[],
    
    -- Education & Career
    preferred_education VARCHAR(100)[],
    preferred_occupations VARCHAR(100)[],
    min_income DECIMAL(12,2),
    max_income DECIMAL(12,2),
    employed_in VARCHAR(20)[],
    
    -- Location
    preferred_countries VARCHAR(100)[],
    preferred_states VARCHAR(100)[],
    preferred_cities VARCHAR(100)[],
    
    -- Other
    preferred_diets VARCHAR(20)[],
    preferred_manglik VARCHAR(20)[],
    physical_status_ok BOOLEAN DEFAULT FALSE,
    
    -- Marital Status
    marital_status VARCHAR(20)[], -- unmarried, divorced, widowed
    
    about_partner TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### documents
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    document_type VARCHAR(50) NOT NULL, -- aadhaar, pan, passport, voter_id, driving_license, address_proof
    
    document_number VARCHAR(50),
    
    front_url VARCHAR(500),
    back_url VARCHAR(500),
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason TEXT,
    
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    
    expiry_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### interests
```sql
CREATE TABLE interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, expired
    
    message TEXT,
    
    sent_via VARCHAR(20) DEFAULT 'platform', -- platform, whatsapp, franchise
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_interest UNIQUE (sender_id, receiver_id)
);

CREATE INDEX idx_interests_sender ON interests(sender_id);
CREATE INDEX idx_interests_receiver ON interests(receiver_id);
CREATE INDEX idx_interests_status ON interests(status);
```

#### messages
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    
    conversation_id UUID NOT NULL,
    
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, document
    content TEXT NOT NULL,
    media_url VARCHAR(500),
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
```

#### appointments
```sql
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL REFERENCES users(id),
    franchise_centre_id UUID REFERENCES franchise_centres(id),
    staff_id UUID REFERENCES users(id),
    
    appointment_type VARCHAR(50) NOT NULL, -- video_kyc, profile_setup, consultation
    
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, in_progress, completed, cancelled, no_show
    
    meeting_link VARCHAR(500),
    meeting_id VARCHAR(100),
    
    notes TEXT,
    
    reminder_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### franchise_staff
```sql
CREATE TABLE franchise_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    franchise_centre_id UUID NOT NULL REFERENCES franchise_centres(id),
    
    staff_code VARCHAR(20) UNIQUE,
    
    designation VARCHAR(100),
    
    permissions JSONB, -- { can_edit_members: true, can_approve_kyc: false }
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### activity_logs
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    old_values JSONB,
    new_values JSONB,
    
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at);
```

---

## 6. Environment Variables

### 6.1 Frontend (.env.example)

```env
# Application
NEXT_PUBLIC_APP_NAME="M-Plus Matrimony"
NEXT_PUBLIC_APP_URL=https://mplus.example.com
NEXT_PUBLIC_APP_VERSION=1.0.0

# Environment
NODE_ENV=development

# API
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000

# Authentication
NEXT_PUBLIC_JWT_EXPIRY=7d
NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY=30d

# Feature Flags
NEXT_PUBLIC_FEATURE_VIDEO_KYC=true
NEXT_PUBLIC_FEATURE_VIDEO_CHAT=true
NEXT_PUBLIC_FEATURE_WHATSAPP=true
NEXT_PUBLIC_FEATURE_MARKETPLACE=true
NEXT_PUBLIC_FEATURE_ADS=true

# Third-Party (Public)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY=6LeXXXXXXXX
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mplus-matrimony.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mplus-matrimony

# CDN & Storage
NEXT_PUBLIC_CDN_URL=https://cdn.mplus.example.com
NEXT_PUBLIC_IMAGE_PROXY_URL=https://images.mplus.example.com

# WhatsApp
NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER=919876543210

# Localization
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,hi,mr

# SEO
NEXT_PUBLIC_SITE_NAME="M-Plus Matrimony"
NEXT_PUBLIC_SITE_DESCRIPTION="Find your perfect match with verified profiles"
NEXT_PUBLIC_OG_IMAGE_URL=https://cdn.mplus.example.com/og-image.jpg

# PWA
NEXT_PUBLIC_SERVICE_WORKER_ENABLED=true
```

### 6.2 Backend (.env.example)

```env
# Application
APP_NAME="M-Plus API"
APP_ENV=development
APP_URL=http://localhost:4000
APP_PORT=4000
APP_DEBUG=true
APP_TIMEZONE=Asia/Kolkata

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mplus_matrimony
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
REDIS_KEY_PREFIX=mplus:

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX_PREFIX=mplus
ELASTICSEARCH_REQUEST_TIMEOUT=30000

# Authentication
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_at_least_64_chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=another_very_long_and_secure_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=30d
JWT_ALGORITHM=HS256

# Password
PASSWORD_MIN_LENGTH=8
PASSWORD_HASH_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5
SEARCH_RATE_LIMIT_MAX=30

# 2FA
TOTP_ISSUER=M-Plus Matrimony
TOTP_WINDOW=1

# Email (Amazon SES / SendGrid)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=AKIAXXXXXXXXX
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_NAME="M-Plus Matrimony"
SMTP_FROM_EMAIL=noreply@mplus.example.com
SMTP_REPLY_TO=support@mplus.example.com

# SMS (MSG91 / Twilio)
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=MPLUSM
MSG91_TEMPLATE_ID=your_template_id
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+15005555006

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_API_VERSION=v18.0

# Payment Gateways
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Storage (AWS S3 / Cloudflare R2)
STORAGE_PROVIDER=aws_s3
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=mplus-uploads
AWS_S3_BUCKET_URL=https://mplus-uploads.s3.ap-south-1.amazonaws.com
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret
R2_BUCKET=mplus-uploads
R2_PUBLIC_URL=https://cdn.mplus.example.com

# CDN
CDN_URL=https://cdn.mplus.example.com
CDN_API_KEY=your_cdn_api_key

# Video (Daily.co / Twilio Video)
VIDEO_PROVIDER=daily
DAILY_API_KEY=your_daily_api_key
DAILY_API_URL=https://api.daily.co/v1
DAILY_ROOM_PREFIX=mplus_kyc_
DAILY_MAX_PARTICIPANTS=2
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_API_KEY=SKxxxxxxxxxx
TWILIO_API_SECRET=your_twilio_api_secret

# Push Notifications (Firebase)
FCM_PROJECT_ID=mplus-matrimony
FCM_PRIVATE_KEY_ID=your_private_key_id
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FCM_CLIENT_EMAIL=firebase-adminsdk@xxxxx.iam.gserviceaccount.com
FCM_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# Ad Monetization
GOOGLE_ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxxxxxxxx
ADMOB_APP_ID=ca-app-pub-xxxxxxxx~xxxxxxxxxx

# Google Services
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_RECAPTCHA_SECRET_KEY=6LeXXXXXXXX

# Analytics
GA_TRACKING_ID=G-XXXXXXXXXX
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE_ENABLED=true
LOG_FILE_PATH=/var/log/mplus
LOG_FILE_MAX_SIZE=100m
LOG_FILE_MAX_FILES=14

# Security
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
HELMET_ENABLED=true
COMPRESSION_ENABLED=true
CSRF_SECRET=your_csrf_secret

# Franchise
DEFAULT_COMMISSION_RATE=10
DEFAULT_FRANCHISE_SUBDOMAIN=members

# Geo Data
DEFAULT_COUNTRY_ID=india_uuid
GEO_CACHE_TTL=86400

# Membership Defaults
FREE_PLAN_CONTACTS_PER_DAY=5
FREE_PLAN_MESSAGE_LIMIT=10
TRIAL_DAYS=7

# Cleanup & Maintenance
DATA_RETENTION_DAYS=365
LOG_RETENTION_DAYS=90
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
```

---

## 7. Third-Party Integrations

### 7.1 Authentication & Security

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Google reCAPTCHA v3 | Bot protection on public forms | Must Have |
| Google OAuth | Social login (Sign in with Google) | Should Have |
| Facebook OAuth | Social login | Should Have |
| Authenticator Apps (TOTP) | 2FA for admin accounts | Must Have |

### 7.2 Communication

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Amazon SES / SendGrid | Transactional emails, newsletters | Must Have |
| MSG91 | SMS OTP, alerts, bulk SMS (India) | Must Have |
| Twilio | SMS OTP, alerts, bulk SMS (International) | Should Have |
| WhatsApp Business API | Profile sharing, notifications | Must Have |
| Firebase Cloud Messaging | Web & mobile push notifications | Must Have |

### 7.3 Payments

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Razorpay | Primary payment gateway (India) | Must Have |
| PayPal | International payments | Should Have |
| Stripe | Alternative payment processing | Nice to Have |

### 7.4 Media & Storage

| Integration | Purpose | Priority |
|-------------|---------|----------|
| AWS S3 | Photo, document, video storage | Must Have |
| CloudFront CDN | Fast image delivery, global CDN | Must Have |
| Cloudflare R2 | Cost-effective S3 alternative | Optional |

### 7.5 Video

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Daily.co | Video KYC & Video Chat (WebRTC) | Must Have |
| Twilio Video | Alternative video solution | Should Have |
| Mediasoup | Self-hosted WebRTC (advanced) | Nice to Have |

### 7.6 Search

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Elasticsearch | Full-text profile search at scale | Must Have |
| Meilisearch | Lightweight alternative | Optional |

### 7.7 Analytics & Monitoring

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Google Analytics 4 | Web analytics, funnel tracking | Must Have |
| Firebase Analytics | Mobile app analytics | Must Have |
| Sentry | Error tracking, performance monitoring | Should Have |
| DataDog / New Relic | APM, infrastructure monitoring | Nice to Have |

### 7.8 Ad Monetization

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Google AdSense | Web banner ads for free members | Must Have |
| Google AdMob | Mobile app ads for free members | Must Have |

### 7.9 Utilities

| Integration | Purpose | Priority |
|-------------|---------|----------|
| MSG91 / Twilio | OTP delivery | Must Have |
| Google Fonts | Typography (Plus Jakarta Sans, Manrope) | Must Have |
| Material Symbols | Icon library | Must Have |
| Pusher / Socket.io | Real-time notifications, chat | Must Have |

### 7.10 Integration Configuration Matrix

```typescript
// Example integration config structure
interface IntegrationConfig {
  // Payment Gateways
  razorpay: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
    timeout: number;
  };
  
  // Communication
  email: {
    provider: 'ses' | 'sendgrid';
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
    from: { name: string; email: string };
  };
  
  sms: {
    provider: 'msg91' | 'twilio';
    authKey?: string;
    accountSid?: string;
    authToken?: string;
    from: string;
  };
  
  // Storage
  storage: {
    provider: 'aws_s3' | 'r2' | 'gcs';
    bucket: string;
    region: string;
    credentials: AWS.Credentials;
    cdnUrl: string;
  };
  
  // Video
  video: {
    provider: 'daily' | 'twilio';
    apiKey: string;
    roomPrefix: string;
    maxParticipants: number;
  };
  
  // Notifications
  push: {
    provider: 'fcm';
    projectId: string;
    privateKey: string;
    clientEmail: string;
  };
}
```

---

## Appendix A: Folder Structure Summary

### Frontend (Next.js)
- **Total Directories:** ~80+
- **Component Pattern:** Feature-based with shared common components
- **Routing:** App Router with route groups for auth/member/admin

### Backend (Node.js/Express)
- **Total Modules:** 15+ feature modules
- **Module Pattern:** Controller → Service → Repository (if separate)
- **Shared Resources:** Middleware, validators, utilities in `/shared`

---

## Appendix B: API Endpoint Categories

| Category | Prefix | Auth Required |
|----------|--------|---------------|
| Auth | `/api/v1/auth/*` | No (some yes) |
| Users | `/api/v1/users/*` | Yes |
| Profiles | `/api/v1/profiles/*` | Yes |
| Search | `/api/v1/search/*` | Yes |
| Matches | `/api/v1/matches/*` | Yes |
| Messaging | `/api/v1/messages/*` | Yes |
| Payments | `/api/v1/payments/*` | Yes |
| Video | `/api/v1/video/*` | Yes |
| Admin | `/api/v1/admin/*` | Admin |
| Franchise | `/api/v1/franchise/*` | Franchise Admin |
| Geo | `/api/v1/geo/*` | Varies |
| CMS | `/api/v1/cms/*` | Admin |
| Reports | `/api/v1/reports/*` | Admin |
| Marketplace | `/api/v1/marketplace/*` | Yes |

---

*Document Version: 1.0*  
*Last Updated: 2026-03-26*
