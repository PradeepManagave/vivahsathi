# M-Plus Matrimony — Remaining Work

**Last Updated:** 2026-06-17 (Session 7)
**Status:** Backend TS: 0 errors | Frontend TS: ? | Build: ✅ SUCCESS (70 pages) | Android APK: ✅ BUILT (targetSdk 34)

---

## Completed

- [x] Next.js 15.3.4 production build restored (fixed CJS bundles, server-only, webpack aliases)
- [x] Android WebView APK: `MPlus-Matrimony-release.apk` (targetSdk 34, signed)
- [x] All 70 pages generating correctly
- [x] Backend TS: 0 errors across all modules
- [x] Backend modules: geo, marketplace, cms, analytics, webhook — all built from scratch
- [x] Database migrations: 001-014 (marketplace, cms, webhook tables)
- [x] Frontend pages: success-stories/[id] detail, help/support
- [x] Auth pages (login, register, verify-2fa, banned, unauthorized) — fully implemented
- [x] All stores, hooks, components, admin/vendor/marketplace pages built

---

## 2. Frontend Pages (Missing)

### 2.1 Auth Flow
- [ ] `/login` — Login page (exists but needs full implementation)
- [ ] `/register` — Multi-step registration (exists but needs completion)
- [ ] `/verify-2fa` — Two-factor authentication page
- [ ] `/banned` — Account banned page
- [ ] `/unauthorized` — Access denied page

### 2.2 Member Routes (`(main)`)
- [ ] `/dashboard` — Member dashboard (exists, needs polish)
- [ ] `/kyc/live` — Live KYC session page
- [ ] `/reports` — Member reports page
- [ ] `/reports/staff` — Staff performance reports
- [x] `/help` — Help & support page
- [ ] `/inbox/requests` — Interest requests tab (needs nested route)
- [ ] `/inbox/messages` — Messages tab (needs nested route)
- [ ] `/inbox/sent` — Sent interests tab (needs nested route)
- [ ] `/chat/[id]` — Chat room page (exists, needs WebSocket integration)
- [ ] `/membership/checkout` — Payment checkout flow
- [ ] `/membership/prepaid` — Prepaid packs page (exists)
- [ ] `/success-stories` — Success stories page (exists)

### 2.3 Admin Routes (`(admin)`)
- [ ] `/admin/payments` — Payment management
- [ ] `/admin/logs` — Activity logs viewer
- [ ] `/admin/members/[id]` — Member detail view
- [ ] `/admin/members/[id]/activity-log` — Member activity log
- [ ] `/admin/franchises/[id]` — Franchise detail view
- [ ] `/admin/reports/revenue` — Revenue reports
- [ ] `/admin/reports/renewals` — Renewal reports
- [ ] `/admin/reports/commissions` — Commission reports
- [ ] `/admin/settings` — Platform settings
- [ ] `/admin/cms/pages` — CMS page editor
- [ ] `/admin/cms/banners` — Banner management
- [ ] `/admin/cms/settings` — CMS settings

### 2.4 Franchise Routes (`(admin)/franchise`)
- [ ] `/franchise/dashboard` — Franchise dashboard
- [ ] `/franchise/members` — Franchise member list
- [ ] `/franchise/members/[id]` — Member detail
- [ ] `/franchise/appointments` — Appointment management
- [ ] `/franchise/staff` — Staff management
- [ ] `/franchise/vendors` — Vendor management
- [ ] `/franchise/reports` — Franchise reports

### 2.5 Vendor Routes (`(vendor)`)
- [ ] `/vendor/listings` — Vendor listings management
- [ ] `/vendor/inquiries` — Vendor inquiry management
- [ ] `/vendor/account` — Vendor account settings

### 2.6 Marketplace Routes
- [ ] `/marketplace/vendors/[id]` — Vendor detail page
- [ ] `/marketplace/classifieds/[id]` — Classified detail page
- [ ] `/marketplace/categories/[id]` — Category detail page

### 2.7 Public Routes (`(public)`)
- [x] `/success-stories` — Success stories listing
- [x] `/success-stories/[id]` — Individual story detail
- [ ] `/profile/[username]` — Public SEO-friendly profile page

---

## 3. Frontend Components (Missing)

### 3.1 Profile Components
- [ ] `ProfileCard` — Compact profile display
- [ ] `ProfileGrid` — Grid layout for profiles
- [ ] `ProfileHeader` — Profile page header
- [ ] `PhotoGallery` — Photo carousel/gallery
- [ ] `HoroscopeCard` — Horoscope display
- [ ] `FamilyInfo` — Family details display
- [ ] `PartnerPreferences` — Preferences display
- [ ] `CompatibilityScore` — Match compatibility meter
- [ ] `VerifyBadge` — Verification badge component
- [ ] `WhatsAppShare` — WhatsApp share button

### 3.2 Search Components
- [ ] `QuickSearch` — Quick search bar
- [ ] `AdvancedSearch` — Advanced search form
- [ ] `SearchFilters` — Filter sidebar
- [ ] `SearchResults` — Results list/grid
- [ ] `SavedSearches` — Saved search manager

### 3.3 Match Components
- [ ] `MatchCard` — Match display card
- [ ] `MatchList` — Match list layout
- [ ] `CompatibilityMeter` — Compatibility visualization
- [ ] `MatchFilters` — Match filtering

### 3.4 Chat/Messaging Components
- [ ] `ChatWindow` — Full chat interface
- [ ] `MessageBubble` — Individual message
- [ ] `ChatList` — Conversation list
- [ ] `InterestRequest` — Interest request UI
- [ ] `VideoCall` — Video call interface

### 3.5 Admin Components
- [ ] `DataTable` — Sortable/filterable table
- [ ] `MemberApproval` — Approval workflow
- [ ] `PhotoReview` — Photo moderation
- [ ] `DocumentViewer` — Document preview
- [ ] `ReportChart` — Chart visualization
- [ ] `BannerManager` — Banner CRUD
- [ ] `GeoDataEditor` — Geo data management

### 3.6 Marketplace Components
- [ ] `VendorCard` — Vendor display card
- [ ] `VendorDetail` — Vendor detail view
- [ ] `CategoryGrid` — Category grid layout
- [ ] `ReviewList` — Review display
- [ ] `InquiryForm` — Vendor inquiry form

### 3.7 Ads Components
- [ ] `AdSenseSlot` — Google AdSense integration
- [ ] `BannerAd` — Banner advertisement
- [ ] `AdManager` — Ad management

### 3.8 Form Components
- [ ] `RegistrationForm` — Multi-step registration
- [ ] `ProfileForm` — Profile editing form
- [ ] `SearchForm` — Search form
- [ ] `HoroscopeForm` — Horoscope entry
- [ ] `AddressForm` — Address entry
- [ ] `GeoDropdown` — Cascading geo dropdown

---

## 4. Frontend Services & Hooks

### 4.1 Custom Hooks
- [ ] `useAuth` — Auth state hook
- [ ] `useUser` — User data hook
- [ ] `useProfile` — Profile management hook
- [ ] `useSearch` — Search state hook
- [ ] `useMatches` — Match management hook
- [ ] `useChat` — Chat/Socket.IO hook
- [ ] `useVideoCall` — WebRTC video call hook
- [ ] `useGeoDropdown` — Cascading geo selector
- [ ] `useTranslation` — i18n hook
- [ ] `useToast` — Toast notification hook

### 4.2 Zustand Stores
- [ ] `authStore` — Auth state (exists, needs completion)
- [ ] `userStore` — User profile state
- [ ] `profileStore` — Profile editing state
- [ ] `searchStore` — Search filters/results
- [ ] `notificationStore` — Notification state
- [ ] `settingsStore` — App settings state

### 4.3 React Context
- [ ] `AuthContext` — Auth provider (exists, needs completion)
- [ ] `ThemeContext` — Theme provider
- [ ] `LanguageContext` — Language/i18n provider
- [ ] `NotificationContext` — Notification provider
- [ ] `ToastContext` — Toast provider

---

## 5. Payment & Checkout Flow

### 5.1 Razorpay Integration
- [ ] `/membership/checkout` — Checkout page
- [ ] Razorpay modal integration
- [ ] Payment success/failure handling
- [ ] Receipt generation
- [ ] Webhook handler (backend exists, needs testing)

### 5.2 Stripe Integration (Optional)
- [ ] Stripe Elements integration
- [ ] Payment intent creation
- [ ] Webhook handler

### 5.3 Offline Payment (Centre Portal)
- [ ] Cash payment recording
- [ ] Receipt generation (PDF)
- [ ] Payment reconciliation

---

## 6. i18n & Localization

### 6.1 Locale Files
- [ ] `en/auth.json` — Auth translations
- [ ] `en/profile.json` — Profile translations
- [ ] `en/search.json` — Search translations
- [ ] `en/admin.json` — Admin translations
- [ ] `hi/common.json` — Hindi common (exists, needs expansion)
- [ ] `hi/auth.json` — Hindi auth
- [ ] `hi/profile.json` — Hindi profile
- [ ] `hi/search.json` — Hindi search
- [ ] `hi/admin.json` — Hindi admin
- [ ] `mr/common.json` — Marathi common (exists, needs expansion)
- [ ] `mr/auth.json` — Marathi auth
- [ ] `mr/profile.json` — Marathi profile
- [ ] `mr/search.json` — Marathi search
- [ ] `mr/admin.json` — Marathi admin

### 6.2 i18n Setup
- [ ] `i18n/i18n.ts` — i18next configuration
- [ ] Language switcher component
- [ ] RTL support (if needed for future languages)
- [ ] Date/number formatting per locale

---

## 7. Backend Work Remaining

### 7.1 Modules to Complete
- [x] `geo` module — Full CRUD for geo data
- [x] `marketplace` module — Vendor/classifieds/category APIs (with inquiries)
- [x] `cms` module — Content pages, testimonials, success stories APIs
- [x] `analytics` module — Dashboard stats, revenue reports, activity reports
- [x] `webhook` module — Event logging and history
- [ ] Connect frontend pages to new marketplace/cms/analytics APIs (currently using mock data)

### 7.2 Integrations to Test
- [ ] Razorpay payment flow
- [ ] Email (SendGrid) templates
- [ ] SMS (MSG91/Twilio) delivery
- [ ] S3 file upload
- [ ] Elasticsearch indexing
- [ ] Firebase push notifications
- [ ] Socket.IO real-time chat

### 7.3 Migrations & Seeds
- [ ] Run all database migrations
- [ ] Seed geo data (countries, states, districts, etc.)
- [ ] Seed membership plans
- [ ] Seed sample members
- [ ] Seed sample vendors

---

## 8. Testing

### 8.1 Unit Tests
- [ ] Backend service tests
- [ ] Backend controller tests
- [ ] Frontend component tests
- [ ] Frontend hook tests
- [ ] Frontend utility tests

**Test Infrastructure Created:**
- `backend/jest.config.js` — Jest configuration
- `backend/tests/setup/afterEnv.ts` — Test environment setup
- `backend/tests/utils/test-helpers.ts` — Test utilities, mocks, and fixtures

### 8.2 Integration Tests
- [x] API endpoint tests (`tests/integrations/api-endpoints.test.ts`)
- [x] Authentication flow tests (`tests/integrations/auth.test.ts`)
- [x] Payment flow tests (`tests/integrations/razorpay.test.ts`)
- [x] Search flow tests (`tests/integrations/elasticsearch.test.ts`)
- [x] Email service tests (`tests/integrations/email.test.ts`)
- [x] SMS service tests (`tests/integrations/sms.test.ts`)
- [x] S3 upload tests (`tests/integrations/s3-upload.test.ts`)

### 8.3 E2E Tests
- [ ] Registration flow
- [ ] Login flow
- [ ] Profile creation
- [ ] Search and match
- [ ] Messaging
- [ ] Payment checkout

---

## 9. DevOps & Deployment

### 9.1 Environment Setup
- [ ] `.env.example` for backend
- [ ] `.env.example` for frontend
- [ ] `.env.production` templates
- [ ] Docker Compose configuration

### 9.2 CI/CD
- [ ] GitHub Actions workflow
- [ ] Lint and typecheck on PR
- [ ] Run tests on PR
- [ ] Build and deploy on merge

### 9.3 Monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Log aggregation
- [ ] Health check endpoints

---

## 10. Documentation

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Frontend component documentation (Storybook)
- [ ] Deployment guide
- [ ] Developer onboarding guide
- [ ] User manual

---

## Priority Order for Next Session

1. ~~**Fix Next.js build** (environment issue)~~ ✅ Done
2. ~~**Payment/checkout flow** (Razorpay integration)~~ ✅ Done
3. ~~**Missing auth pages** (verify-2fa, banned, unauthorized)~~ ✅ Done
4. ~~**Key missing components** (ProfileCard, MatchCard, ChatWindow, ProfileGrid, PhotoGallery)~~ ✅ Done
5. ~~**Custom hooks** (useAuth, useChat, useSearch, useProfile)~~ ✅ Done
6. ~~**Zustand stores** (chat-store, match-store)~~ ✅ Done
7. ~~**Admin pages** (payments, activity-log, settings, revenue)~~ ✅ Done
8. ~~**Vendor pages** (listings, inquiries)~~ ✅ Done
9. ~~**Marketplace vendor detail**~~ ✅ Done
10. ~~**i18n expansion** (Hindi/Marathi translations for auth, profile, search)~~ ✅ Done
11. ~~**Remaining pages** (member detail, classifieds detail, franchise detail)~~ ✅ Done
12. ~~**Backend integration testing** (Razorpay, email, SMS, S3, Elasticsearch)~~ ✅ Done
13. ~~**Backend modules** (marketplace, cms, analytics, webhook + migrations)~~ ✅ Done
14. **Frontend API integration** — Connect success-stories, help, marketplace pages to new backend APIs
15. **Inbox sub-pages** — Build `/inbox/requests`, `/inbox/messages`, `/inbox/sent` nested routes
16. **Testing** (unit, E2E) — Integration tests created, unit/E2E pending
