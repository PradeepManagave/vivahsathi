-- ============================================================
-- Migration: 001_create_initial_schema.sql
-- Description: Create initial database schema for M-Plus Matrimony
-- Created: 2026-03-26
-- ============================================================

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentication
    email CITEXT UNIQUE,
    phone VARCHAR(15) UNIQUE,
    phone_country_code VARCHAR(5) DEFAULT '+91',
    password_hash VARCHAR(255),
    
    -- OAuth
    google_id VARCHAR(255) UNIQUE,
    facebook_id VARCHAR(255) UNIQUE,
    
    -- Account
    role VARCHAR(30) NOT NULL DEFAULT 'free_member' CHECK (
        role IN ('guest', 'free_member', 'paid_member', 'centre_staff', 'centre_admin', 'super_admin')
    ),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'inactive', 'pending_approval', 'suspended', 'banned')
    ),
    
    -- Verification
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Franchise
    franchise_centre_id UUID,
    
    -- Security
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    
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
    CONSTRAINT users_failed_attempts_non_negative CHECK (failed_login_attempts >= 0)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_franchise ON users(franchise_centre_id) WHERE franchise_centre_id IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Names
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150),
    profile_slug VARCHAR(150) UNIQUE NOT NULL,
    
    -- Demographics
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE NOT NULL,
    age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))) STORED,
    
    -- Physical
    height_cm INTEGER CHECK (height_cm > 0 AND height_cm < 300),
    weight_kg INTEGER CHECK (weight_kg > 0 AND weight_kg < 500),
    complexion VARCHAR(20),
    body_type VARCHAR(20),
    physical_status VARCHAR(20) DEFAULT 'normal' CHECK (physical_status IN ('normal', 'disabled')),
    
    -- Religion & Community
    religion VARCHAR(50) NOT NULL,
    caste VARCHAR(100),
    sub_caste VARCHAR(100),
    mother_tongue VARCHAR(50),
    gothra VARCHAR(100),
    gotra VARCHAR(100),
    
    -- Education & Career
    highest_education VARCHAR(150),
    education_details VARCHAR(255),
    college_university VARCHAR(255),
    occupation VARCHAR(100),
    occupation_details VARCHAR(255),
    employed_in VARCHAR(30),
    annual_income DECIMAL(12, 2) CHECK (annual_income >= 0),
    work_location VARCHAR(255),
    
    -- Lifestyle
    diet VARCHAR(20) DEFAULT 'veg',
    smoking VARCHAR(20) DEFAULT 'never',
    drinking VARCHAR(20) DEFAULT 'never',
    hobbies TEXT[],
    
    -- Bio
    about_me TEXT,
    expectations TEXT,
    
    -- Partner Preferences (JSONB)
    partner_preference JSONB DEFAULT '{}',
    
    -- Marital Status
    marital_status VARCHAR(20) DEFAULT 'unmarried',
    
    -- Verification
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (
        kyc_status IN ('pending', 'in_progress', 'verified', 'rejected')
    ),
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    kyc_verified_by UUID REFERENCES users(id),
    
    -- Privacy
    profile_visibility VARCHAR(20) DEFAULT 'public',
    photo_visibility VARCHAR(20) DEFAULT 'all',
    
    -- Stats
    profile_views INTEGER NOT NULL DEFAULT 0,
    interests_received INTEGER NOT NULL DEFAULT 0,
    interests_sent INTEGER NOT NULL DEFAULT 0,
    shortlists_received INTEGER NOT NULL DEFAULT 0,
    shortlists_sent INTEGER NOT NULL DEFAULT 0,
    
    -- Completion
    profile_completion_percent INTEGER NOT NULL DEFAULT 0 CHECK (
        profile_completion_percent >= 0 AND profile_completion_percent <= 100
    ),
    
    -- Features
    is_featured BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    
    -- Settings
    preferred_language VARCHAR(10) DEFAULT 'en',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT profiles_age_valid CHECK (age >= 18 AND age <= 100)
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_religion ON profiles(religion);
CREATE INDEX idx_profiles_caste ON profiles(caste) WHERE caste IS NOT NULL;
CREATE INDEX idx_profiles_age ON profiles(age) WHERE age IS NOT NULL;
CREATE INDEX idx_profiles_marital_status ON profiles(marital_status);
CREATE INDEX idx_profiles_education ON profiles(highest_education) WHERE highest_education IS NOT NULL;
CREATE INDEX idx_profiles_occupation ON profiles(occupation) WHERE occupation IS NOT NULL;
CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX idx_profiles_slug ON profiles(profile_slug);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX idx_profiles_completion ON profiles(profile_completion_percent DESC);
CREATE INDEX idx_profiles_featured ON profiles(is_featured) WHERE is_featured = TRUE;

-- ============================================================================
-- FAMILY INFO TABLE
-- ============================================================================

CREATE TABLE family_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Family Type
    family_type VARCHAR(20),
    family_status VARCHAR(30),
    family_values VARCHAR(30),
    
    -- Father
    father_name VARCHAR(150),
    father_occupation VARCHAR(100),
    father_status VARCHAR(20) DEFAULT 'alive',
    
    -- Mother
    mother_name VARCHAR(150),
    mother_occupation VARCHAR(100),
    mother_status VARCHAR(20) DEFAULT 'alive',
    
    -- Siblings
    brothers_count INTEGER DEFAULT 0 CHECK (brothers_count >= 0),
    brothers_married INTEGER DEFAULT 0,
    sisters_count INTEGER DEFAULT 0 CHECK (sisters_count >= 0),
    sisters_married INTEGER DEFAULT 0,
    
    -- Location
    family_location VARCHAR(255),
    family_city VARCHAR(100),
    family_state VARCHAR(100),
    
    -- Description
    about_family TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT family_info_siblings_check CHECK (
        brothers_married <= brothers_count AND 
        sisters_married <= sisters_count
    )
);

CREATE INDEX idx_family_info_profile ON family_info(profile_id);

-- ============================================================================
-- MEMBERSHIP PLANS TABLE
-- ============================================================================

CREATE TABLE membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    discounted_price DECIMAL(10, 2) CHECK (discounted_price >= 0),
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Duration
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    
    -- Features
    max_contacts_per_day INTEGER,
    max_photos INTEGER DEFAULT 5,
    can_view_contacts BOOLEAN DEFAULT TRUE,
    can_video_chat BOOLEAN DEFAULT FALSE,
    can_add_social_links BOOLEAN DEFAULT FALSE,
    is_ad_free BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_trial BOOLEAN DEFAULT FALSE,
    trial_days INTEGER,
    
    -- Display
    display_order INTEGER DEFAULT 0,
    is_recommended BOOLEAN DEFAULT FALSE,
    
    -- Benefits
    benefits JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plans_slug ON membership_plans(slug);
CREATE INDEX idx_plans_active ON membership_plans(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_plans_order ON membership_plans(display_order);

-- ============================================================================
-- USER MEMBERSHIPS TABLE
-- ============================================================================

CREATE TABLE user_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES membership_plans(id),
    
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'expired', 'cancelled', 'pending', 'suspended', 'trial')
    ),
    
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    
    -- Usage
    contacts_viewed INTEGER DEFAULT 0,
    contacts_viewed_today INTEGER DEFAULT 0,
    contacts_viewed_at DATE,
    messages_sent INTEGER DEFAULT 0,
    
    -- Source
    franchise_centre_id UUID REFERENCES franchise_centres(id),
    enrolled_by UUID REFERENCES users(id),
    
    -- Payment
    payment_id UUID,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT user_memberships_dates_check CHECK (end_date > start_date)
);

CREATE INDEX idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_plan ON user_memberships(plan_id);
CREATE INDEX idx_user_memberships_active ON user_memberships(user_id, status, end_date) WHERE status = 'active';
CREATE INDEX idx_user_memberships_expiring ON user_memberships(end_date) WHERE status = 'active';

-- ============================================================================
-- PHOTOS TABLE
-- ============================================================================

CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    original_url VARCHAR(500) NOT NULL,
    large_url VARCHAR(500),
    medium_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (
        approval_status IN ('pending', 'approved', 'rejected')
    ),
    rejection_reason TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    
    visibility VARCHAR(20) DEFAULT 'all',
    is_protected BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT photos_primary_limit CHECK (
        is_primary = FALSE OR (
            SELECT COUNT(*) FROM photos p 
            WHERE p.profile_id = photos.profile_id AND p.is_primary = TRUE
        ) < 1
    )
);

CREATE INDEX idx_photos_user ON photos(user_id);
CREATE INDEX idx_photos_profile ON photos(profile_id);
CREATE INDEX idx_photos_primary ON photos(profile_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_photos_approval ON photos(approval_status) WHERE approval_status = 'pending';

-- ============================================================================
-- INTERESTS TABLE
-- ============================================================================

CREATE TABLE interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired')
    ),
    
    message TEXT,
    sent_via VARCHAR(20) DEFAULT 'platform',
    
    response_message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT interests_no_self CHECK (sender_id != receiver_id)
);

CREATE UNIQUE INDEX idx_interests_unique ON interests(sender_id, receiver_id);
CREATE INDEX idx_interests_sender ON interests(sender_id);
CREATE INDEX idx_interests_receiver ON interests(receiver_id);
CREATE INDEX idx_interests_status ON interests(status) WHERE status = 'pending';

-- ============================================================================
-- FRANCHISE CENTRES TABLE
-- ============================================================================

CREATE TABLE franchise_centres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    slug VARCHAR(200) UNIQUE,
    
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    
    address_line VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Business
    registration_number VARCHAR(50),
    gstin VARCHAR(15),
    commission_percent DECIMAL(5, 2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'active', 'suspended', 'closed')
    ),
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Admin
    admin_user_id UUID UNIQUE REFERENCES users(id),
    
    -- Branding
    logo_url VARCHAR(500),
    primary_color VARCHAR(7),
    
    -- Subdomain
    subdomain VARCHAR(100) UNIQUE,
    
    -- Stats
    total_members INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_franchise_code ON franchise_centres(code);
CREATE INDEX idx_franchise_status ON franchise_centres(status);
CREATE INDEX idx_franchise_admin ON franchise_centres(admin_user_id) WHERE admin_user_id IS NOT NULL;

-- ============================================================================
-- ACTIVITY LOGS TABLE
-- ============================================================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES users(id),
    actor_type VARCHAR(20) DEFAULT 'user',
    
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    resource_name VARCHAR(255),
    
    description TEXT,
    
    old_values JSONB,
    new_values JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user ON activity_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);

-- ============================================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_info_updated_at
    BEFORE UPDATE ON family_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_plans_updated_at
    BEFORE UPDATE ON membership_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_memberships_updated_at
    BEFORE UPDATE ON user_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchise_centres_updated_at
    BEFORE UPDATE ON franchise_centres
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
