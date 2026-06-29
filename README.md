# M-Plus Matrimony Platform

Enterprise-grade multilingual matrimony SaaS platform with multi-centre franchise architecture.

## Project Structure

```
C:\pradeep\vivahsathi\
├── ARCHITECTURE.md          # Architecture documentation
├── DATABASE_SCHEMA.md        # Database schema documentation
├── frontend/                # Next.js 14 Frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── .env.local.example
│   └── src/
│       ├── app/            # App Router pages
│       ├── components/    # React components
│       ├── lib/           # Utilities, API, constants
│       ├── store/          # Zustand state management
│       ├── hooks/          # Custom React hooks
│       ├── types/          # TypeScript definitions
│       ├── styles/         # Global CSS
│       └── middleware.ts   # i18n middleware
│
├── backend/                 # Node.js/Express API
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── app.ts          # Express app setup
│       ├── server.ts        # Server entry point
│       ├── config/         # Configuration files
│       ├── modules/        # Feature modules
│       │   ├── auth/
│       │   ├── users/
│       │   ├── profiles/
│       │   ├── search/
│       │   ├── matches/
│       │   ├── messaging/
│       │   ├── membership/
│       │   ├── video-kyc/
│       │   ├── geo/
│       │   ├── notifications/
│       │   ├── admin/
│       │   ├── franchise/
│       │   ├── marketplace/
│       │   ├── payments/
│       │   └── cms/
│       ├── shared/         # Shared utilities
│       │   ├── middleware/
│       │   └── utils/
│       └── types/
│
└── database/
    ├── migrations/
    │   └── 001_create_initial_schema.sql
    └── seeds/
        ├── 001_seed_membership_plans.sql
        └── 002_seed_geo_data.sql
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Run migrations
npm run migration:run

# Seed data
npm run seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

## Frontend Features

- **Next.js 14 App Router** with TypeScript
- **Tailwind CSS** with custom design system
- **Zustand** for state management
- **React Query** for data fetching
- **i18n** support (English, Hindi, Marathi)
- **PWA** ready with next-pwa

### Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #570013 | Brand color, CTAs |
| Secondary | #7b5800 | Gold accents |
| Background | #fff8ef | Warm cream base |

### Component Categories

- `ui/` - Base components (Button, Input, Card, Badge)
- `forms/` - Form components with validation
- `layouts/` - Header, Footer, Sidebar
- `shared/` - Cross-module components

## Backend Features

- **Express.js** with TypeScript
- **Knex.js** for database queries
- **Redis** for caching and sessions
- **JWT** authentication
- **Rate limiting** and security headers
- **Winston** logging

### Module Structure

Each module follows consistent pattern:
```
module-name/
├── module.routes.ts    # Route definitions
├── module.controller.ts
├── module.service.ts
├── module.validator.ts
└── __tests__/
```

### Security

- Helmet.js security headers
- CORS configuration
- Rate limiting per endpoint
- Input validation with express-validator
- SQL injection prevention
- XSS protection

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Refresh token

### Profiles
- `GET /api/v1/profiles` - List profiles
- `GET /api/v1/profiles/:id` - Get profile
- `PATCH /api/v1/profiles/:id` - Update profile
- `POST /api/v1/profiles/:id/photos` - Upload photo

### Search
- `GET /api/v1/search` - Search profiles
- `GET /api/v1/matches` - Get matches

### Membership
- `GET /api/v1/membership/plans` - List plans
- `POST /api/v1/membership/upgrade` - Upgrade plan

### Admin
- `GET /api/v1/admin/members` - List all members
- `PATCH /api/v1/admin/members/:id/approve` - Approve member
- `GET /api/v1/admin/reports` - View reports

## Database Tables

| Table | Description |
|-------|-------------|
| users | User accounts |
| profiles | Profile information |
| family_info | Family details |
| photos | Profile photos |
| interests | Connection requests |
| membership_plans | Available plans |
| user_memberships | Active subscriptions |
| franchise_centres | Regional offices |
| geo_data | Location hierarchy |

## User Roles

| Role | Level | Access |
|------|-------|--------|
| Guest | 0 | Browse limited profiles |
| Free Member | 1 | Basic features + ads |
| Paid Member | 2 | Full access |
| Centre Staff | 3 | Franchise operations |
| Centre Admin | 4 | Regional management |
| Super Admin | 5 | Full platform control |

## Documentation

- [Architecture](ARCHITECTURE.md) - System architecture
- [Database Schema](DATABASE_SCHEMA.md) - Database design
- [Blueprint](../docs/blueprint.pdf) - Feature specifications
- [PRD](../docs/prd.pdf) - Product requirements

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mplus_matrimony
DB_USER=postgres
DB_PASSWORD=secret

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email
SMTP_PASSWORD=app-password

RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-xxx
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
```

## License

Proprietary - All rights reserved
