-- ============================================================
-- Migration: 002_create_geo_tables.sql
-- Description: Create geo locations and village requests tables
-- Created: 2026-03-26
-- ============================================================

BEGIN;

-- ============================================================================
-- GEO LOCATIONS TABLE
-- ============================================================================

CREATE TABLE geo_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    location_type VARCHAR(20) NOT NULL CHECK (
        location_type IN ('country', 'state', 'district', 'taluka', 'village')
    ),
    
    name VARCHAR(200) NOT NULL,
    name_local VARCHAR(200),
    code VARCHAR(50),
    pincode VARCHAR(10),
    
    parent_id UUID REFERENCES geo_locations(id) ON DELETE SET NULL,
    
    level INTEGER NOT NULL CHECK (level >= 0 AND level <= 4),
    
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT geo_locations_unique UNIQUE (parent_id, name, location_type)
);

CREATE INDEX idx_geo_type ON geo_locations(location_type);
CREATE INDEX idx_geo_parent ON geo_locations(parent_id);
CREATE INDEX idx_geo_pincode ON geo_locations(pincode) WHERE pincode IS NOT NULL;
CREATE INDEX idx_geo_name ON geo_locations(name);
CREATE INDEX idx_geo_active ON geo_locations(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_geo_level ON geo_locations(level);

-- ============================================================================
-- VILLAGE REQUESTS TABLE
-- ============================================================================

CREATE TABLE village_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    taluka_id UUID NOT NULL REFERENCES geo_locations(id),
    
    name VARCHAR(200) NOT NULL,
    pincode VARCHAR(10),
    description TEXT,
    
    requested_by UUID NOT NULL REFERENCES users(id),
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'rejected')
    ),
    
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_village_requests_taluka ON village_requests(taluka_id);
CREATE INDEX idx_village_requests_user ON village_requests(requested_by);
CREATE INDEX idx_village_requests_status ON village_requests(status);
CREATE INDEX idx_village_requests_created ON village_requests(created_at DESC);

-- ============================================================================
-- HOROSCOPES TABLE
-- ============================================================================

CREATE TABLE horoscopes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    
    rashi VARCHAR(50),
    nakshatra VARCHAR(100),
    nakshatra_pada INTEGER CHECK (nakshatra_pada >= 1 AND nakshatra_pada <= 4),
    
    gotra VARCHAR(100),
    gothra VARCHAR(100),
    
    manglik VARCHAR(20) CHECK (manglik IN ('yes', 'no', 'anupooshan', 'partial', 'anshik')),
    
    ashta_koot INTEGER CHECK (ashta_koot >= 0 AND ashta_koot <= 36),
    dashakoot INTEGER CHECK (dashakoot >= 0 AND dashakoot <= 100),
    total_gun DECIMAL(5, 2),
    
    birth_date DATE,
    birth_time TIME,
    birth_place VARCHAR(255),
    
    document_url VARCHAR(500),
    document_status VARCHAR(20) DEFAULT 'pending' CHECK (
        document_status IN ('pending', 'approved', 'rejected', 'expired')
    ),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_horoscopes_profile ON horoscopes(profile_id);
CREATE INDEX idx_horoscopes_rashi ON horoscopes(rashi) WHERE rashi IS NOT NULL;
CREATE INDEX idx_horoscopes_nakshatra ON horoscopes(nakshatra) WHERE nakshatra IS NOT NULL;
CREATE INDEX idx_horoscopes_manglik ON horoscopes(manglik) WHERE manglik IS NOT NULL;

-- ============================================================================
-- USER SOCIAL LINKS TABLE
-- ============================================================================

CREATE TABLE user_social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    linkedin VARCHAR(255),
    youtube VARCHAR(255),
    twitter VARCHAR(255),
    
    website VARCHAR(255),
    blog VARCHAR(255),
    
    show_to_contacts_only BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_links_user ON user_social_links(user_id);

-- ============================================================================
-- PROFILE VISITS TABLE
-- ============================================================================

CREATE TABLE profile_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    visitor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visited_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    visit_time TIME NOT NULL DEFAULT CURRENT_TIME,
    
    source VARCHAR(50) DEFAULT 'search',
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT profile_visits_unique UNIQUE (visitor_id, visited_id, created_at)
);

CREATE INDEX idx_visits_visitor ON profile_visits(visitor_id);
CREATE INDEX idx_visits_visited ON profile_visits(visited_id);
CREATE INDEX idx_visits_date ON profile_visits(visit_date DESC);

-- ============================================================================
-- TRIGGER: Update updated_at for village_requests
-- ============================================================================

CREATE TRIGGER update_village_requests_updated_at
    BEFORE UPDATE ON village_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horoscopes_updated_at
    BEFORE UPDATE ON horoscopes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_social_links_updated_at
    BEFORE UPDATE ON user_social_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GEO TRIGGER
-- ============================================================================

CREATE TRIGGER update_geo_locations_updated_at
    BEFORE UPDATE ON geo_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INCREMENT profile_views ON profile visit
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_profile_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET profile_views = profile_views + 1 
    WHERE user_id = NEW.visited_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_increment_profile_views
    AFTER INSERT ON profile_visits
    FOR EACH ROW EXECUTE FUNCTION increment_profile_views();

COMMIT;
