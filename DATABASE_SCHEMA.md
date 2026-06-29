# M-Plus Matrimony — Database Schema Documentation

**Version:** 1.0  
**Database:** PostgreSQL 15+  
**Date:** 2026-03-26

---

## Table of Contents

1. [Migration File Naming Convention](#migration-file-naming-convention)
2. [Schema Overview](#schema-overview)
3. [Table Definitions](#table-definitions)
4. [Index Strategy](#index-strategy)
5. [Constraints](#constraints)

---

## 1. Migration File Naming Convention

### Format
```
{YYYYMMDD}_{HHMMSS}_{migration_name}.sql
```

### Example
```
20260326000001_create_initial_schema.sql
20260326120000_add_geo_tables.sql
20260327090000_add_user_indexes.sql
```

### Directory Structure
```
src/database/migrations/
├── 001_create_initial_schema.sql
├── 002_create_geo_tables.sql
├── 003_create_membership_tables.sql
├── 004_create_franchise_tables.sql
├── 005_create_messaging_tables.sql
├── 006_create_indexes.sql
├── 007_seed_membership_plans.sql
└── 008_seed_geo_data.sql
```

---

## 2. Schema Overview

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USERS & PROFILES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────┐     ┌──────────────┐     ┌─────────────┐                 │
│    │  users   │────<│   profiles   │────<│ family_info │                 │
│    └────┬─────┘     └──────┬───────┘     └─────────────┘                 │
│         │                  │                                               │
│         │                  ├────< photos                                  │
│         │                  ├────< addresses                                │
│         │                  ├────< interests (sent)                         │
│         │                  │                                              │
│         │           ┌──────┴───────┐     ┌─────────────┐                  │
│         │           │ user_address │────<│  geo_data   │                  │
│         │           └─────────────┘     └─────────────┘                  │
│         │                                                                │
│         ├────< user_memberships >──── membership_plans                   │
│         │                                                                │
│         ├────< franchise_staff >──── franchise_centres                   │
│         │                   │                                            │
│         └───────────────────┴───────────────────────────────────────────  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Creation
```sql
-- Migration: 001_create_initial_schema.sql
-- Description: Create initial database and extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create database (run separately as superuser)
-- CREATE DATABASE mplus_matrimony;
-- CREATE DATABASE mplus_matrimony OWNER mplus_app;
```

---

## 3. Table Definitions

### 3.1 users

```sql
-- Migration: 001_create_initial_schema.sql
-- Table: users
-- Description: Core user authentication and account management

CREATE TABLE users (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentication Fields
    email CITEXT UNIQUE,
    phone VARCHAR(15) UNIQUE,
    phone_country_code VARCHAR(5) DEFAULT '+91',
    password_hash VARCHAR(255),
    password_changed_at TIMESTAMP WITH TIME ZONE,
    
    -- Account Status
    role VARCHAR(30) NOT NULL DEFAULT 'guest' CHECK (
        role IN ('guest', 'free_member', 'paid_member', 'centre_staff', 'centre_admin', 'super_admin')
    ),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'inactive', 'suspended', 'banned', 'pending_approval')
    ),
    
    -- Verification
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Franchise Association (nullable - most users won't belong to a franchise)
    franchise_centre_id UUID,
    
    -- Security
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    two_factor_recovery_codes JSONB,
    
    -- OAuth Providers
    google_id VARCHAR(255) UNIQUE,
    facebook_id VARCHAR(255) UNIQUE,
    
    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_reason VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT users_email_or_phone_required CHECK (
        (email IS NOT NULL AND email <> '') OR 
        (phone IS NOT NULL AND phone <> '')
    ),
    CONSTRAINT users_password_or_oauth_required CHECK (
        (password_hash IS NOT NULL) OR 
        (google_id IS NOT NULL) OR 
        (facebook_id IS NOT NULL)
    ),
    CONSTRAINT users_role_requires_franchise CHECK (
        (role IN ('centre_staff', 'centre_admin')) = (franchise_centre_id IS NOT NULL)
    ),
    CONSTRAINT users_failed_attempts_non_negative CHECK (failed_login_attempts >= 0)
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_franchise ON users(franchise_centre_id) WHERE franchise_centre_id IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_facebook_id ON users(facebook_id) WHERE facebook_id IS NOT NULL;

-- Comments
COMMENT ON TABLE users IS 'Core user accounts and authentication';
COMMENT ON COLUMN users.role IS 'User role: guest, free_member, paid_member, centre_staff, centre_admin, super_admin';
COMMENT ON COLUMN users.status IS 'Account status: active, inactive, suspended, banned, pending_approval';
```

---

### 3.2 profiles

```sql
-- Migration: 001_create_initial_schema.sql
-- Table: profiles
-- Description: User profile details for matrimony matching

CREATE TABLE profiles (
    -- Primary Key & Foreign Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150),
    
    -- SEO-Friendly URL Slug
    profile_slug VARCHAR(150) UNIQUE NOT NULL,
    
    -- Demographics
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE NOT NULL,
    age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))) STORED,
    
    -- Physical Attributes
    height_cm INTEGER CHECK (height_cm > 0 AND height_cm < 300),
    weight_kg INTEGER CHECK (weight_kg > 0 AND weight_kg < 500),
    complexion VARCHAR(20) CHECK (complexion IN ('fair', 'wheatish', 'dark', 'very_fair')),
    body_type VARCHAR(20) CHECK (body_type IN ('slim', 'average', 'athletic', 'heavy')),
    physical_status VARCHAR(20) DEFAULT 'normal' CHECK (physical_status IN ('normal', 'disabled')),
    
    -- Religion & Community
    religion VARCHAR(50) NOT NULL,
    caste VARCHAR(100),
    sub_caste VARCHAR(100),
    mother_tongue VARCHAR(50),
    gothra VARCHAR(100),
    gotra VARCHAR(100),
    
    -- Family Background (reference)
    family_info_id UUID,
    
    -- Education & Career
    highest_education VARCHAR(150),
    education_details VARCHAR(255),
    college_university VARCHAR(255),
    occupation VARCHAR(100),
    occupation_details VARCHAR(255),
    employed_in VARCHAR(30) CHECK (employed_in IN ('private', 'government', 'business', 'self_employed', 'not_employed')),
    annual_income DECIMAL(12, 2) CHECK (annual_income >= 0),
    work_location VARCHAR(255),
    
    -- Lifestyle
    diet VARCHAR(20) DEFAULT 'veg' CHECK (diet IN ('veg', 'non_veg', 'vegan', 'jain', 'occasional')),
    smoking VARCHAR(20) DEFAULT 'never' CHECK (smoking IN ('never', 'occasionally', 'regularly')),
    drinking VARCHAR(20) DEFAULT 'never' CHECK (drinking IN ('never', 'occasionally', 'regularly')),
    hobbies TEXT[],
    
    -- About & Bio
    about_me TEXT,
    expectations TEXT,
    
    -- Partner Preferences (JSONB for flexibility)
    partner_preference JSONB DEFAULT '{
        "min_age": null,
        "max_age": null,
        "min_height_cm": null,
        "max_height_cm": null,
        "religions": [],
        "castes": [],
        "mother_tongues": [],
        "educations": [],
        "occupations": [],
        "min_income": null,
        "max_income": null,
        "diet": [],
        "marital_status": [],
        "countries": [],
        "states": [],
        "cities": []
    }'::JSONB,
    
    -- Marital Status
    marital_status VARCHAR(20) DEFAULT 'unmarried' CHECK (
        marital_status IN ('unmarried', 'divorced', 'widowed', 'separated')
    ),
    
    -- Profile Photo
    primary_photo_id UUID,
    
    -- Verification Status
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (
        kyc_status IN ('pending', 'in_progress', 'verified', 'rejected')
    ),
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    kyc_verified_by UUID REFERENCES users(id),
    
    -- Profile Visibility & Privacy
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (
        profile_visibility IN ('public', 'members_only', 'contacts_only', 'hidden')
    ),
    photo_visibility VARCHAR(20) DEFAULT 'all' CHECK (
        photo_visibility IN ('all', 'contacts_only', 'premium_only', 'hidden')
    ),
    show_phone_public BOOLEAN DEFAULT FALSE,
    show_email_public BOOLEAN DEFAULT FALSE,
    
    -- Profile Statistics
    profile_views INTEGER NOT NULL DEFAULT 0,
    interests_received INTEGER NOT NULL DEFAULT 0,
    interests_sent INTEGER NOT NULL DEFAULT 0,
    shortlists_received INTEGER NOT NULL DEFAULT 0,
    shortlists_sent INTEGER NOT NULL DEFAULT 0,
    
    -- Profile Completion
    profile_completion_percent INTEGER NOT NULL DEFAULT 0 CHECK (
        profile_completion_percent >= 0 AND profile_completion_percent <= 100
    ),
    last_completion_update TIMESTAMP WITH TIME ZONE,
    
    -- Feature Flags
    is_featured BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    
    -- Preferred Language
    preferred_language VARCHAR(10) DEFAULT 'en',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional Constraints
    CONSTRAINT profiles_age_valid CHECK (
        age >= 18 AND age <= 100
    ),
    CONSTRAINT profiles_income_non_negative CHECK (
        annual_income IS NULL OR annual_income >= 0
    )
);

-- Indexes for profiles table
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_religion ON profiles(religion);
CREATE INDEX idx_profiles_caste ON profiles(caste) WHERE caste IS NOT NULL;
CREATE INDEX idx_profiles_mother_tongue ON profiles(mother_tongue) WHERE mother_tongue IS NOT NULL;
CREATE INDEX idx_profiles_age ON profiles(age) WHERE age IS NOT NULL;
CREATE INDEX idx_profiles_marital_status ON profiles(marital_status);
CREATE INDEX idx_profiles_education ON profiles(highest_education) WHERE highest_education IS NOT NULL;
CREATE INDEX idx_profiles_occupation ON profiles(occupation) WHERE occupation IS NOT NULL;
CREATE INDEX idx_profiles_income ON profiles(annual_income) WHERE annual_income IS NOT NULL;
CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX idx_profiles_visibility ON profiles(profile_visibility);
CREATE INDEX idx_profiles_slug ON profiles(profile_slug);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX idx_profiles_updated_at ON profiles(updated_at DESC);
CREATE INDEX idx_profiles_completion ON profiles(profile_completion_percent DESC);
CREATE INDEX idx_profiles_featured ON profiles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_profiles_premium ON profiles(is_premium) WHERE is_premium = TRUE;
CREATE INDEX idx_profiles_online ON profiles(is_online, last_active_at) WHERE is_online = TRUE;
CREATE INDEX idx_profiles_partner_pref ON profiles USING GIN (partner_preference);

-- Comments
COMMENT ON TABLE profiles IS 'User profile information for matrimony matching';
COMMENT ON COLUMN profiles.profile_slug IS 'SEO-friendly URL slug generated from name and ID';
COMMENT ON COLUMN profiles.partner_preference IS 'JSONB storing partner preference criteria';
COMMENT ON COLUMN profiles.profile_completion_percent IS 'Auto-calculated field representing profile completeness';
```

---

### 3.3 family_info

```sql
-- Migration: 001_create_initial_schema.sql
-- Table: family_info
-- Description: Family background information for profiles

CREATE TABLE family_info (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Key to Profile
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Family Type
    family_type VARCHAR(20) CHECK (
        family_type IN ('nuclear', 'joint', 'extended')
    ),
    family_status VARCHAR(30) CHECK (
        family_status IN ('lower_middle', 'middle_class', 'upper_middle', 'affluent', 'rich')
    ),
    family_values VARCHAR(30) CHECK (
        family_values IN ('traditional', 'moderate', 'liberal')
    ),
    
    -- Father's Information
    father_name VARCHAR(150),
    father_occupation VARCHAR(100),
    father_company VARCHAR(200),
    father_income DECIMAL(12, 2),
    father_status VARCHAR(20) DEFAULT 'alive' CHECK (
        father_status IN ('alive', 'deceased')
    ),
    
    -- Mother's Information
    mother_name VARCHAR(150),
    mother_occupation VARCHAR(100),
    mother_company VARCHAR(200),
    mother_income DECIMAL(12, 2),
    mother_status VARCHAR(20) DEFAULT 'alive' CHECK (
        mother_status IN ('alive', 'deceased')
    ),
    
    -- Siblings Information
    brothers_count INTEGER DEFAULT 0 CHECK (brothers_count >= 0),
    brothers_married INTEGER DEFAULT 0 CHECK (brothers_married >= 0),
    sisters_count INTEGER DEFAULT 0 CHECK (sisters_count >= 0),
    sisters_married INTEGER DEFAULT 0 CHECK (sisters_married >= 0),
    
    -- Family Location
    family_location VARCHAR(255),
    family_city VARCHAR(100),
    family_state VARCHAR(100),
    family_country VARCHAR(100),
    family_pincode VARCHAR(10),
    
    -- Property & Assets
    house_type VARCHAR(30) CHECK (
        house_type IN ('owned', 'rented', 'lease', 'parents')
    ),
    ancestral_home BOOLEAN DEFAULT FALSE,
    
    -- Family Description
    about_family TEXT,
    
    -- Financial Backing
    financial_status VARCHAR(30) CHECK (
        financial_status IN ('moderate', 'comfortable', 'well_settled', 'affluent')
    ),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT family_info_married_siblings_check CHECK (
        brothers_married <= brothers_count AND 
        sisters_married <= sisters_count
    )
);

-- Indexes for family_info table
CREATE INDEX idx_family_info_profile ON family_info(profile_id);
CREATE INDEX idx_family_info_type ON family_info(family_type) WHERE family_type IS NOT NULL;
CREATE INDEX idx_family_info_city ON family_info(family_city) WHERE family_city IS NOT NULL;
CREATE INDEX idx_family_info_state ON family_info(family_state) WHERE family_state IS NOT NULL;

-- Comments
COMMENT ON TABLE family_info IS 'Family background details for matrimony profiles';
COMMENT ON COLUMN family_info.family_status IS 'Economic status of the family';
COMMENT ON COLUMN family_info.family_values IS 'Cultural/traditional values followed by family';
```

---

### 3.4 geo_data

```sql
-- Migration: 002_create_geo_tables.sql
-- Table: geo_data
-- Description: Hierarchical geographic location data (countries, states, districts, talukas, villages)

CREATE TABLE geo_data (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Location Type (hierarchy level)
    location_type VARCHAR(20) NOT NULL CHECK (
        location_type IN ('country', 'state', 'district', 'taluka', 'village')
    ),
    
    -- Location Names
    name VARCHAR(150) NOT NULL,
    name_local VARCHAR(150),
    name_short VARCHAR(50),
    
    -- Codes
    code VARCHAR(20),
    iso_code VARCHAR(10),
    
    -- Hierarchy
    parent_id UUID REFERENCES geo_data(id) ON DELETE CASCADE,
    level INTEGER NOT NULL, -- 0=country, 1=state, 2=district, 3=taluka, 4=village
    
    -- Additional Data
    pincode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Metadata
    population INTEGER,
    area_sq_km DECIMAL(10, 2),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- For villages submitted by users
    is_user_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage Statistics
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT geo_data_level_check CHECK (
        CASE 
            WHEN location_type = 'country' THEN level = 0
            WHEN location_type = 'state' THEN level = 1
            WHEN location_type = 'district' THEN level = 2
            WHEN location_type = 'taluka' THEN level = 3
            WHEN location_type = 'village' THEN level = 4
            ELSE FALSE
        END
    ),
    CONSTRAINT geo_data_parent_hierarchy CHECK (
        parent_id IS NULL OR level = (SELECT level FROM geo_data pd WHERE pd.id = parent_id) + 1
    )
);

-- Indexes for geo_data table
CREATE INDEX idx_geo_type ON geo_data(location_type);
CREATE INDEX idx_geo_parent ON geo_data(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_geo_level ON geo_data(level);
CREATE INDEX idx_geo_country ON geo_data(name) WHERE level = 0;
CREATE INDEX idx_geo_state ON geo_data(name, parent_id) WHERE level = 1;
CREATE INDEX idx_geo_district ON geo_data(name, parent_id) WHERE level = 2;
CREATE INDEX idx_geo_taluka ON geo_data(name, parent_id) WHERE level = 3;
CREATE INDEX idx_geo_village ON geo_data(name, parent_id) WHERE level = 4;
CREATE INDEX idx_geo_pincode ON geo_data(pincode) WHERE pincode IS NOT NULL;
CREATE INDEX idx_geo_active ON geo_data(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_geo_codes ON geo_data(code) WHERE code IS NOT NULL;
CREATE INDEX idx_geo_iso ON geo_data(iso_code) WHERE iso_code IS NOT NULL;

-- Partial indexes for user submissions
CREATE INDEX idx_geo_user_submitted ON geo_data(id, name) WHERE is_user_submitted = TRUE;

-- Comments
COMMENT ON TABLE geo_data IS 'Hierarchical geographic locations: countries, states, districts, talukas, villages';
COMMENT ON COLUMN geo_data.level IS 'Hierarchy depth: 0=country, 1=state, 2=district, 3=taluka, 4=village';
COMMENT ON COLUMN geo_data.is_user_submitted IS 'Flag for user-submitted village/town entries awaiting approval';
```

---

### 3.5 addresses

```sql
-- Migration: 001_create_initial_schema.sql
-- Table: addresses
-- Description: Multiple address storage for profiles (permanent, current, office, etc.)

CREATE TABLE addresses (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Address Type
    address_type VARCHAR(30) NOT NULL CHECK (
        address_type IN ('permanent', 'current', 'office', 'ancestral', 'other')
    ),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Address Lines
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    landmark VARCHAR(100),
    
    -- Geographic Hierarchy (using geo_data)
    country_id UUID REFERENCES geo_data(id),
    state_id UUID REFERENCES geo_data(id),
    district_id UUID REFERENCES geo_data(id),
    taluka_id UUID REFERENCES geo_data(id),
    village_id UUID REFERENCES geo_data(id),
    
    -- Free-form location (for areas not in geo_data)
    city VARCHAR(100),
    locality VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Legacy fields (for backward compatibility)
    house_no VARCHAR(50),
    street VARCHAR(200),
    
    -- Contact Information
    phone VARCHAR(15),
    
    -- Full Address (denormalized for search)
    full_address TEXT,
    formatted_address TEXT,
    
    -- Geocoding
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Status
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    
    -- Visibility
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT addresses_primary_unique CHECK (
        is_primary = FALSE OR (
            SELECT COUNT(*) FROM addresses a 
            WHERE a.user_id = addresses.user_id AND a.is_primary = TRUE
        ) <= 1
    )
);

-- Indexes for addresses table
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_profile ON addresses(profile_id) WHERE profile_id IS NOT NULL;
CREATE INDEX idx_addresses_type ON addresses(address_type);
CREATE INDEX idx_addresses_primary ON addresses(user_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_addresses_country ON addresses(country_id) WHERE country_id IS NOT NULL;
CREATE INDEX idx_addresses_state ON addresses(state_id) WHERE state_id IS NOT NULL;
CREATE INDEX idx_addresses_district ON addresses(district_id) WHERE district_id IS NOT NULL;
CREATE INDEX idx_addresses_taluka ON addresses(taluka_id) WHERE taluka_id IS NOT NULL;
CREATE INDEX idx_addresses_village ON addresses(village_id) WHERE village_id IS NOT NULL;
CREATE INDEX idx_addresses_pincode ON addresses(pincode) WHERE pincode IS NOT NULL;

-- Comments
COMMENT ON TABLE addresses IS 'Multiple address storage for user profiles';
COMMENT ON COLUMN addresses.address_type IS 'Type of address: permanent, current, office, ancestral, other';
```

---

### 3.6 membership_plans

```sql
-- Migration: 003_create_membership_tables.sql
-- Table: membership_plans
-- Description: Available membership plans and their features

CREATE TABLE membership_plans (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Plan Identification
    name VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100), -- Hindi translation
    name_mr VARCHAR(100), -- Marathi translation
    slug VARCHAR(100) NOT NULL UNIQUE,
    short_description VARCHAR(255),
    description TEXT,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    discounted_price DECIMAL(10, 2) CHECK (discounted_price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    gst_percent DECIMAL(5, 2) DEFAULT 18.00,
    gst_included BOOLEAN DEFAULT TRUE,
    
    -- Duration
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    duration_label VARCHAR(50), -- e.g., "3 Months", "1 Year"
    
    -- Feature Limits
    max_contacts_per_day INTEGER, -- NULL = unlimited
    max_contacts_total INTEGER, -- NULL = unlimited
    max_messages_per_day INTEGER, -- NULL = unlimited
    max_photos INTEGER DEFAULT 5,
    max_horoscopes INTEGER DEFAULT 3,
    max_family_photos INTEGER DEFAULT 5,
    
    -- Feature Flags
    can_view_contacts BOOLEAN DEFAULT TRUE,
    can_send_messages BOOLEAN DEFAULT TRUE,
    can_receive_messages BOOLEAN DEFAULT TRUE,
    can_video_chat BOOLEAN DEFAULT FALSE,
    can_join_video_call BOOLEAN DEFAULT FALSE,
    can_add_social_links BOOLEAN DEFAULT FALSE,
    can_view_social_links BOOLEAN DEFAULT FALSE,
    can_access_horoscope BOOLEAN DEFAULT TRUE,
    can_view_horoscope_others BOOLEAN DEFAULT FALSE,
    can_use_whatsapp_share BOOLEAN DEFAULT TRUE,
    is_ad_free BOOLEAN DEFAULT FALSE,
    is_premium_search BOOLEAN DEFAULT FALSE,
    is_featured_profile BOOLEAN DEFAULT FALSE,
    can_view_mutual_matches BOOLEAN DEFAULT TRUE,
    can_save_searches BOOLEAN DEFAULT TRUE,
    can_set_availability BOOLEAN DEFAULT FALSE,
    
    -- Display Settings
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_recommended BOOLEAN DEFAULT FALSE,
    highlight_color VARCHAR(7),
    
    -- Validity
    is_trial BOOLEAN DEFAULT FALSE,
    trial_days INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Validity Period
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Plan Type
    plan_type VARCHAR(20) DEFAULT 'subscription' CHECK (
        plan_type IN ('subscription', 'prepaid', 'addon', 'trial')
    ),
    
    -- Benefits (JSONB for flexible feature list)
    benefits JSONB DEFAULT '[]'::JSONB,
    badge_text VARCHAR(50),
    badge_color VARCHAR(7),
    
    -- Statistics
    total_subscribers INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT membership_plans_price_check CHECK (
        discounted_price IS NULL OR discounted_price <= price
    )
);

-- Indexes for membership_plans table
CREATE INDEX idx_plans_slug ON membership_plans(slug);
CREATE INDEX idx_plans_active ON membership_plans(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_plans_featured ON membership_plans(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_plans_order ON membership_plans(display_order);
CREATE INDEX idx_plans_price ON membership_plans(price);
CREATE INDEX idx_plans_type ON membership_plans(plan_type);
CREATE INDEX idx_plans_validity ON membership_plans(valid_from, valid_until);

-- Comments
COMMENT ON TABLE membership_plans IS 'Membership subscription plans and pricing';
COMMENT ON COLUMN membership_plans.plan_type IS 'Plan category: subscription, prepaid, addon, trial';
COMMENT ON COLUMN membership_plans.benefits IS 'JSONB array of benefit descriptions';
```

---

### 3.7 user_memberships

```sql
-- Migration: 003_create_membership_tables.sql
-- Table: user_memberships
-- Description: User subscription records linking users to membership plans

CREATE TABLE user_memberships (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES membership_plans(id),
    
    -- Subscription Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'expired', 'cancelled', 'pending', 'suspended', 'trial')
    ),
    
    -- Subscription Period
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    renewed_from UUID REFERENCES user_memberships(id), -- Previous membership
    
    -- Trial Information
    is_trial BOOLEAN DEFAULT FALSE,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Payment Information
    payment_id UUID, -- References payments table
    payment_method VARCHAR(30),
    payment_status VARCHAR(20) CHECK (
        payment_status IS NULL OR payment_status IN ('pending', 'completed', 'failed', 'refunded')
    ),
    
    -- Pricing at Purchase
    price_paid DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(10, 2) DEFAULT 0,
    coupon_code VARCHAR(50),
    gst_amount DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Usage Tracking
    contacts_viewed INTEGER DEFAULT 0,
    contacts_viewed_today INTEGER DEFAULT 0,
    contacts_viewed_at DATE,
    messages_sent INTEGER DEFAULT 0,
    messages_sent_today INTEGER DEFAULT 0,
    messages_sent_at DATE,
    last_contact_view TIMESTAMP WITH TIME ZONE,
    
    -- Franchise Association
    franchise_centre_id UUID REFERENCES franchise_centres(id),
    enrolled_by UUID REFERENCES users(id), -- Staff who enrolled the member
    
    -- Source
    source VARCHAR(20) DEFAULT 'online' CHECK (
        source IN ('online', 'franchise', 'walk_in', 'referral', 'campaign')
    ),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Billing
    billing_name VARCHAR(200),
    billing_email VARCHAR(255),
    billing_phone VARCHAR(15),
    billing_address_id UUID, -- References addresses
    
    -- Status Change Information
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT user_memberships_dates_check CHECK (end_date > start_date),
    CONSTRAINT user_memberships_price_check CHECK (price_paid >= 0)
);

-- Indexes for user_memberships table
CREATE INDEX idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_plan ON user_memberships(plan_id);
CREATE INDEX idx_user_memberships_status ON user_memberships(status);
CREATE INDEX idx_user_memberships_active ON user_memberships(user_id, status, end_date) 
    WHERE status = 'active';
CREATE INDEX idx_user_memberships_expiring ON user_memberships(end_date) 
    WHERE status = 'active';
CREATE INDEX idx_user_memberships_franchise ON user_memberships(franchise_centre_id) 
    WHERE franchise_centre_id IS NOT NULL;
CREATE INDEX idx_user_memberships_created ON user_memberships(created_at DESC);
CREATE INDEX idx_user_memberships_source ON user_memberships(source) WHERE source IS NOT NULL;
CREATE INDEX idx_user_memberships_renewed_from ON user_memberships(renewed_from) 
    WHERE renewed_from IS NOT NULL;

-- Comments
COMMENT ON TABLE user_memberships IS 'User subscription records with usage tracking';
COMMENT ON COLUMN membership_plans.status IS 'Subscription state: active, expired, cancelled, pending, suspended, trial';
COMMENT ON COLUMN user_memberships.contacts_viewed_today IS 'Daily counter reset at midnight';
```

---

### 3.8 franchise_centres

```sql
-- Migration: 004_create_franchise_tables.sql
-- Table: franchise_centres
-- Description: Franchise centre/branch information for regional operations

CREATE TABLE franchise_centres (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    name VARCHAR(200) NOT NULL,
    name_local VARCHAR(200),
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g., "PUNE-001", "MUM-002"
    slug VARCHAR(200) UNIQUE,
    
    -- Contact Information
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    alt_phone VARCHAR(15),
    whatsapp_number VARCHAR(15),
    
    -- Address
    address_id UUID, -- References addresses table
    address_line VARCHAR(500),
    landmark VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Geographic Region
    country_id UUID REFERENCES geo_data(id),
    state_id UUID REFERENCES geo_data(id),
    district_id UUID REFERENCES geo_data(id),
    
    -- Branding
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    tagline VARCHAR(200),
    
    -- Admin Account
    admin_user_id UUID, -- References users (set after user creation)
    
    -- Business Details
    registration_number VARCHAR(50),
    gstin VARCHAR(15),
    pan VARCHAR(10),
    tan VARCHAR(10),
    bank_name VARCHAR(100),
    bank_account_no VARCHAR(30),
    bank_ifsc VARCHAR(20),
    
    -- Commission & Pricing
    commission_percent DECIMAL(5, 2) DEFAULT 0 CHECK (commission_percent >= 0 AND commission_percent <= 100),
    commission_type VARCHAR(20) DEFAULT 'revenue_share' CHECK (
        commission_type IN ('revenue_share', 'fixed_per_lead', 'fixed_per_sale')
    ),
    custom_pricing_enabled BOOLEAN DEFAULT FALSE,
    price_modifier_percent DECIMAL(5, 2) DEFAULT 0,
    
    -- Operating Hours
    operating_hours JSONB DEFAULT '{
        "monday": { "open": "09:00", "close": "18:00", "closed": false },
        "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
        "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
        "thursday": { "open": "09:00", "close": "18:00", "closed": false },
        "friday": { "open": "09:00", "close": "18:00", "closed": false },
        "saturday": { "open": "09:00", "close": "18:00", "closed": false },
        "sunday": { "open": "10:00", "close": "16:00", "closed": true }
    }'::JSONB,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    
    -- Contact Person
    contact_person_name VARCHAR(150),
    contact_person_phone VARCHAR(15),
    contact_person_email VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'active', 'suspended', 'closed')
    ),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    
    -- Approval Workflow
    application_date TIMESTAMP WITH TIME ZONE,
    approval_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Subdomain
    subdomain VARCHAR(100) UNIQUE,
    custom_domain VARCHAR(255),
    
    -- Statistics
    total_members INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    pending_commission DECIMAL(15, 2) DEFAULT 0,
    paid_commission DECIMAL(15, 2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id)
);

-- Indexes for franchise_centres table
CREATE INDEX idx_franchise_code ON franchise_centres(code);
CREATE INDEX idx_franchise_slug ON franchise_centres(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_franchise_admin ON franchise_centres(admin_user_id) WHERE admin_user_id IS NOT NULL;
CREATE INDEX idx_franchise_status ON franchise_centres(status);
CREATE INDEX idx_franchise_country ON franchise_centres(country_id) WHERE country_id IS NOT NULL;
CREATE INDEX idx_franchise_state ON franchise_centres(state_id) WHERE state_id IS NOT NULL;
CREATE INDEX idx_franchise_district ON franchise_centres(district_id) WHERE district_id IS NOT NULL;
CREATE INDEX idx_franchise_subdomain ON franchise_centres(subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX idx_franchise_created ON franchise_centres(created_at DESC);
CREATE INDEX idx_franchise_deleted ON franchise_centres(deleted_at) WHERE deleted_at IS NOT NULL;

-- Comments
COMMENT ON TABLE franchise_centres IS 'Regional franchise centre/branch management';
COMMENT ON COLUMN franchise_centres.commission_type IS 'Commission model: revenue_share, fixed_per_lead, fixed_per_sale';
COMMENT ON COLUMN franchise_centres.price_modifier_percent IS 'Price adjustment percentage for this franchise';
```

---

### 3.9 photos

```sql
-- Migration: 001_create_initial_schema.sql
-- Table: photos
-- Description: Profile photo management with approval workflow

CREATE TABLE photos (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Photo Files
    original_url VARCHAR(500) NOT NULL,
    large_url VARCHAR(500),
    medium_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    watermark_url VARCHAR(500),
    
    -- File Information
    original_filename VARCHAR(255),
    file_size INTEGER, -- bytes
    mime_type VARCHAR(50),
    width INTEGER,
    height INTEGER,
    
    -- Display Settings
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    
    -- Approval Workflow
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (
        approval_status IN ('pending', 'approved', 'rejected', 'under_review')
    ),
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    
    -- Privacy Settings
    visibility VARCHAR(20) DEFAULT 'all' CHECK (
        visibility IN ('all', 'contacts_only', 'premium_only', 'hidden')
    ),
    is_protected BOOLEAN DEFAULT FALSE, -- Requires interest before viewing
    hide_from_guests BOOLEAN DEFAULT TRUE,
    
    -- Tags
    tags TEXT[], -- e.g., ['formal', 'candid', 'traditional']
    
    -- Usage Statistics
    view_count INTEGER DEFAULT 0,
    
    -- AI Moderation
    moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (
        moderation_status IN ('pending', 'passed', 'flagged', 'failed')
    ),
    moderation_confidence DECIMAL(5, 4),
    moderation_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT photos_primary_limit CHECK (
        is_primary = FALSE OR (
            SELECT COUNT(*) FROM photos p 
            WHERE p.profile_id = photos.profile_id AND p.is_primary = TRUE
        ) <= 1
    ),
    CONSTRAINT photos_max_per_profile CHECK (
        (SELECT COUNT(*) FROM photos p WHERE p.profile_id = photos.profile_id) < 10
    )
);

-- Indexes for photos table
CREATE INDEX idx_photos_user ON photos(user_id);
CREATE INDEX idx_photos_profile ON photos(profile_id);
CREATE INDEX idx_photos_primary ON photos(profile_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_photos_approval ON photos(approval_status) WHERE approval_status = 'pending';
CREATE INDEX idx_photos_order ON photos(profile_id, display_order);
CREATE INDEX idx_photos_created ON photos(created_at DESC);
CREATE INDEX idx_photos_moderation ON photos(moderation_status) WHERE moderation_status = 'flagged';

-- Comments
COMMENT ON TABLE photos IS 'Profile photo management with moderation and approval';
COMMENT ON COLUMN photos.visibility IS 'Who can view this photo: all, contacts_only, premium_only, hidden';
COMMENT ON COLUMN photos.is_protected IS 'Photo hidden until user receives interest';
```

---

### 3.10 interests

```sql
-- Migration: 005_create_messaging_tables.sql
-- Table: interests
-- Description: Interest/request management between members

CREATE TABLE interests (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Users Involved
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Interest Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired')
    ),
    
    -- Message
    message TEXT,
    
    -- How Interest Was Sent
    sent_via VARCHAR(20) DEFAULT 'platform' CHECK (
        sent_via IN ('platform', 'whatsapp', 'franchise', 'referral')
    ),
    
    -- Response
    response_message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE, -- Auto-expire pending interests
    
    -- Constraints
    CONSTRAINT interests_no_self_check CHECK (sender_id != receiver_id),
    CONSTRAINT interests_unique_pair CHECK (
        (sender_id, receiver_id) NOT IN (
            SELECT receiver_id, sender_id FROM interests i 
            WHERE i.sender_id = interests.sender_id AND i.receiver_id = interests.receiver_id
        )
    ),
    CONSTRAINT interests_unique_request CHECK (
        NOT EXISTS (
            SELECT 1 FROM interests i 
            WHERE i.sender_id = interests.sender_id AND i.receiver_id = interests.receiver_id
        )
    )
);

-- Create exclusion constraint to prevent duplicate interests
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE interests ADD CONSTRAINT interests_no_duplicate 
    EXCLUDE USING gist (
        sender_id WITH =, 
        receiver_id WITH =, 
        tsrange(created_at, COALESCE(expires_at, 'infinity')) WITH &&
    ) WHERE (status = 'pending');

-- Indexes for interests table
CREATE INDEX idx_interests_sender ON interests(sender_id);
CREATE INDEX idx_interests_receiver ON interests(receiver_id);
CREATE INDEX idx_interests_sender_status ON interests(sender_id, status);
CREATE INDEX idx_interests_receiver_status ON interests(receiver_id, status);
CREATE INDEX idx_interests_status ON interests(status);
CREATE INDEX idx_interests_created ON interests(created_at DESC);
CREATE INDEX idx_interests_expires ON interests(expires_at) 
    WHERE expires_at IS NOT NULL AND status = 'pending';
CREATE INDEX idx_interests_mutual ON interests(sender_id, receiver_id);

-- Comments
COMMENT ON TABLE interests IS 'Express interest/connection requests between members';
COMMENT ON COLUMN interests.status IS 'Request state: pending, accepted, rejected, cancelled, expired';
COMMENT ON COLUMN interests.sent_via IS 'Channel through which interest was sent: platform, whatsapp, franchise, referral';
```

---

## 4. Additional Required Tables

### 3.11 franchise_staff

```sql
-- Migration: 004_create_franchise_tables.sql
-- Table: franchise_staff
-- Description: Staff members associated with franchise centres

CREATE TABLE franchise_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    franchise_centre_id UUID NOT NULL REFERENCES franchise_centres(id),
    
    staff_code VARCHAR(20) UNIQUE,
    designation VARCHAR(100),
    
    permissions JSONB DEFAULT '{
        "can_manage_members": true,
        "can_view_reports": true,
        "can_manage_appointments": true,
        "can_conduct_kyc": true,
        "can_manage_vendors": false,
        "can_collect_payments": true,
        "can_view_financials": false
    }'::JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    can_login BOOLEAN DEFAULT TRUE,
    
    reporting_to UUID REFERENCES franchise_staff(id),
    
    max_appointments_per_day INTEGER DEFAULT 10,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_user ON franchise_staff(user_id);
CREATE INDEX idx_staff_franchise ON franchise_staff(franchise_centre_id);
CREATE INDEX idx_staff_reporting ON franchise_staff(reporting_to) WHERE reporting_to IS NOT NULL;
```

---

### 3.12 messages

```sql
-- Migration: 005_create_messaging_tables.sql
-- Table: messages
-- Description: Direct messaging between members

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    conversation_id UUID NOT NULL,
    
    message_type VARCHAR(20) DEFAULT 'text' CHECK (
        message_type IN ('text', 'image', 'document', 'voice', 'template')
    ),
    content TEXT NOT NULL,
    media_url VARCHAR(500),
    media_thumbnail VARCHAR(500),
    media_size INTEGER,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    read_by UUID REFERENCES users(id),
    
    is_deleted_sender BOOLEAN DEFAULT FALSE,
    is_deleted_receiver BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    reply_to_id UUID REFERENCES messages(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT messages_no_self CHECK (sender_id != receiver_id)
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

---

### 3.13 conversations

```sql
-- Migration: 005_create_messaging_tables.sql
-- Table: conversations
-- Description: Groups messages between two users

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    participant_1 UUID NOT NULL REFERENCES users(id),
    participant_2 UUID NOT NULL REFERENCES users(id),
    
    last_message_id UUID REFERENCES messages(id),
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    participant_1_unread INTEGER DEFAULT 0,
    participant_2_unread INTEGER DEFAULT 0,
    
    is_archived_1 BOOLEAN DEFAULT FALSE,
    is_archived_2 BOOLEAN DEFAULT FALSE,
    
    is_blocked_1 BOOLEAN DEFAULT FALSE,
    is_blocked_2 BOOLEAN DEFAULT FALSE,
    blocked_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT conversations_no_self CHECK (participant_1 < participant_2)
);

CREATE INDEX idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
```

---

### 3.14 horoscopes

```sql
-- Migration: 001_create_initial_schema.sql
-- Table: horoscopes
-- Description: Horoscope/kundali information for profiles

CREATE TABLE horoscopes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Astrological Details
    rashi VARCHAR(50),
    nakshatra VARCHAR(50),
    nakshatra_pada INTEGER CHECK (nakshatra_pada BETWEEN 1 AND 4),
    gotra VARCHAR(100),
    gothra VARCHAR(100),
    
    -- Manglik Status
    manglik VARCHAR(20) CHECK (manglik IN ('yes', 'no', 'anupooshan', 'partial', 'anshik')),
    manglik_details TEXT,
    
    -- Kundali Matching Scores
    ashta_koot INTEGER CHECK (ashta_koot BETWEEN 0 AND 36),
    dashakoot INTEGER CHECK (dashakoot BETWEEN 0 AND 36),
    total_gun INTEGER CHECK (total_gun BETWEEN 0 AND 36),
    
    -- Birth Details
    birth_date DATE,
    birth_time TIME,
    birth_place VARCHAR(255),
    birth_latitude DECIMAL(10, 8),
    birth_longitude DECIMAL(11, 8),
    
    -- Documents
    document_url VARCHAR(500),
    document_status VARCHAR(20) DEFAULT 'pending' CHECK (
        document_status IN ('pending', 'approved', 'rejected')
    ),
    document_name VARCHAR(255),
    
    -- Astro Report
    astro_report_url VARCHAR(500),
    
    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_horoscopes_profile ON horoscopes(profile_id);
CREATE INDEX idx_horoscopes_rashi ON horoscopes(rashi) WHERE rashi IS NOT NULL;
CREATE INDEX idx_horoscopes_nakshatra ON horoscopes(nakshatra) WHERE nakshatra IS NOT NULL;
CREATE INDEX idx_horoscopes_manglik ON horoscopes(manglik) WHERE manglik IS NOT NULL;
CREATE INDEX idx_horoscopes_document_status ON horoscopes(document_status) WHERE document_status = 'pending';
```

---

### 3.15 documents

```sql
-- Migration: 001_create_initial_schema.sql
-- Table: documents
-- Description: Identity and address verification documents

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    document_type VARCHAR(50) NOT NULL CHECK (
        document_type IN ('aadhaar', 'pan', 'passport', 'voter_id', 'driving_license', 'address_proof', 'income_proof', 'education_proof')
    ),
    
    document_number VARCHAR(100),
    
    front_url VARCHAR(500),
    back_url VARCHAR(500),
    full_url VARCHAR(500),
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'rejected', 'expired')
    ),
    rejection_reason TEXT,
    
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    expiry_date DATE,
    issued_date DATE,
    
    is_primary BOOLEAN DEFAULT TRUE, -- Primary ID proof
    
    ocr_data JSONB, -- Extracted OCR data
    ocr_confidence DECIMAL(5, 4),
    
    verification_method VARCHAR(20) CHECK (
        verification_method IN ('manual', 'automated', 'aadhaar_verification', ' DigiLocker')
    ),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_profile ON documents(profile_id) WHERE profile_id IS NOT NULL;
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status) WHERE status = 'pending';
CREATE INDEX idx_documents_expiry ON documents(expiry_date) WHERE expiry_date IS NOT NULL;
```

---

### 3.16 shortlists

```sql
-- Migration: 005_create_messaging_tables.sql
-- Table: shortlists
-- Description: Member shortlist/bookmarks

CREATE TABLE shortlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shortlisted_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    notes TEXT,
    
    source VARCHAR(30) DEFAULT 'profile' CHECK (
        source IN ('profile', 'search', 'match', 'recommendation')
    ),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT shortlists_no_self CHECK (user_id != shortlisted_user_id),
    CONSTRAINT shortlists_unique UNIQUE (user_id, shortlisted_user_id)
);

CREATE INDEX idx_shortlists_user ON shortlists(user_id);
CREATE INDEX idx_shortlists_shortlisted ON shortlists(shortlisted_user_id);
CREATE INDEX idx_shortlists_created ON shortlists(created_at DESC);
```

---

### 3.17 activity_logs

```sql
-- Migration: 001_create_initial_schema.sql
-- Table: activity_logs
-- Description: User activity tracking and audit logs

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES users(id),
    actor_type VARCHAR(20) DEFAULT 'user' CHECK (
        actor_type IN ('user', 'staff', 'system', 'admin')
    ),
    
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    resource_name VARCHAR(255),
    
    description TEXT,
    
    old_values JSONB,
    new_values JSONB,
    
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user ON activity_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_resource ON activity_logs(resource_type, resource_id) 
    WHERE resource_type IS NOT NULL;
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_actor ON activity_logs(actor_type) WHERE actor_type IS NOT NULL;
```

---

## 4. Index Strategy

### 4.1 Primary Indexes (Auto-created)
- All primary keys (id) have B-tree indexes

### 4.2 Foreign Key Indexes
```sql
-- Critical foreign key indexes for query performance
CREATE INDEX idx_users_franchise ON users(franchise_centre_id);
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_profiles_family ON profiles(family_info_id) WHERE family_info_id IS NOT NULL;
CREATE INDEX idx_family_info_profile ON family_info(profile_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_geo ON addresses(village_id, taluka_id, district_id, state_id, country_id);
CREATE INDEX idx_photos_user ON photos(user_id);
CREATE INDEX idx_photos_profile ON photos(profile_id);
CREATE INDEX idx_interests_sender ON interests(sender_id);
CREATE INDEX idx_interests_receiver ON interests(receiver_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_plan ON user_memberships(plan_id);
CREATE INDEX idx_franchise_staff_user ON franchise_staff(user_id);
CREATE INDEX idx_franchise_staff_centre ON franchise_staff(franchise_centre_id);
```

### 4.3 Composite Indexes
```sql
-- Common query patterns
CREATE INDEX idx_profiles_search_basic ON profiles(gender, religion, mother_tongue);
CREATE INDEX idx_profiles_search_advanced ON profiles(gender, religion, caste, highest_education, occupation);
CREATE INDEX idx_profiles_age_income ON profiles(gender, age, annual_income) WHERE annual_income IS NOT NULL;
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_interests_bidirectional ON interests(sender_id, receiver_id);
```

### 4.4 Partial Indexes
```sql
-- Active records only
CREATE INDEX idx_users_active ON users(email) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_profiles_public ON profiles(profile_slug) WHERE profile_visibility = 'public';
CREATE INDEX idx_memberships_current ON user_memberships(user_id) WHERE status = 'active';
CREATE INDEX idx_photos_pending ON photos(id) WHERE approval_status = 'pending';
CREATE INDEX idx_photos_primary_profile ON photos(profile_id) WHERE is_primary = TRUE;
```

---

## 5. Constraints

### 5.1 Check Constraints Summary
```sql
-- Age validation
ALTER TABLE profiles ADD CONSTRAINT profiles_age_range 
    CHECK (age >= 18 AND age <= 100);

-- Price validation
ALTER TABLE membership_plans ADD CONSTRAINT plans_price_positive 
    CHECK (price >= 0);
ALTER TABLE membership_plans ADD CONSTRAINT plans_discount_valid 
    CHECK (discounted_price IS NULL OR discounted_price <= price);

-- Commission validation
ALTER TABLE franchise_centres ADD CONSTRAINT franchise_commission_range 
    CHECK (commission_percent >= 0 AND commission_percent <= 100);

-- Physical attributes validation
ALTER TABLE profiles ADD CONSTRAINT profiles_height_range 
    CHECK (height_cm IS NULL OR (height_cm > 0 AND height_cm < 300));
ALTER TABLE profiles ADD CONSTRAINT profiles_weight_range 
    CHECK (weight_kg IS NULL OR (weight_kg > 0 AND weight_kg < 500));

-- Counters non-negative
ALTER TABLE profiles ADD CONSTRAINT profiles_views_non_negative 
    CHECK (profile_views >= 0);
ALTER TABLE user_memberships ADD CONSTRAINT memberships_contacts_non_negative 
    CHECK (contacts_viewed >= 0 AND messages_sent >= 0);
```

### 5.2 Unique Constraints
```sql
-- Email uniqueness (case-insensitive handled by CITEXT)
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email) WHERE email IS NOT NULL;

-- Phone uniqueness
ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone) WHERE phone IS NOT NULL;

-- Profile slug uniqueness
ALTER TABLE profiles ADD CONSTRAINT profiles_slug_unique UNIQUE (profile_slug);

-- Plan slug uniqueness
ALTER TABLE membership_plans ADD CONSTRAINT plans_slug_unique UNIQUE (slug);

-- Franchise code uniqueness
ALTER TABLE franchise_centres ADD CONSTRAINT franchise_code_unique UNIQUE (code);

-- Interest pair uniqueness (prevent duplicate interests)
ALTER TABLE interests ADD CONSTRAINT interests_pair_unique 
    UNIQUE (sender_id, receiver_id);
```

### 5.3 Exclusion Constraints (PostgreSQL specific)
```sql
-- Prevent overlapping memberships for same user
ALTER TABLE user_memberships ADD CONSTRAINT memberships_no_overlap 
    EXCLUDE USING gist (
        user_id WITH =, 
        tsrange(start_date, end_date) WITH &&
    ) WHERE (status IN ('active', 'trial'));

-- Prevent duplicate interests in time range
ALTER TABLE interests ADD CONSTRAINT interests_no_duplicate_period
    EXCLUDE USING gist (
        sender_id WITH =, 
        receiver_id WITH =,
        tsrange(created_at, expires_at) WITH &&
    ) WHERE (status = 'pending');
```

---

## 6. Migration Template

```sql
-- Migration: {sequence}_{migration_name}.sql
-- Created: {date}
-- Author: {author}
-- Description: {description}

-- Migration metadata
-- Up: Create/alter objects
-- Down: Rollback changes

BEGIN;

-- ============================================================================
-- UP Migration
-- ============================================================================

-- Add your SQL here

-- Example:
-- CREATE TABLE example (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     name VARCHAR(100) NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- ============================================================================
-- DOWN Migration (for rollback)
-- ============================================================================

-- DROP TABLE IF EXISTS example;

COMMIT;
```

---

## 7. Seed Data Templates

### Membership Plans Seed
```sql
-- Migration: 007_seed_membership_plans.sql
INSERT INTO membership_plans (name, slug, price, duration_days, can_view_contacts, can_video_chat, is_ad_free, benefits) VALUES
('Free', 'free', 0, 0, TRUE, FALSE, FALSE, '["Basic profile", "Limited contacts", "Ad-supported"]),
('Silver', 'silver', 999, 90, TRUE, FALSE, FALSE, '["10 contacts/day", "Send messages", "View horoscopes"]),
('Gold', 'gold', 2499, 180, TRUE, TRUE, FALSE, '["25 contacts/day", "Video chat", "Ad-free browsing"]),
('Premium', 'premium', 4999, 365, TRUE, TRUE, TRUE, '["Unlimited contacts", "Premium placement", "24/7 support"]);
```

### Geo Data Seed (India + Maharashtra)
```sql
-- Migration: 008_seed_geo_data.sql
-- Insert countries, states, districts for India
```

---

*Document Version: 1.0*  
*Last Updated: 2026-03-26*
