-- ============================================================
// Migration: 003_create_search_tables.sql
-- Description: Create search-related tables
-- Created: 2026-03-26
-- ============================================================

BEGIN;

-- ============================================================================
-- SAVED SEARCHES TABLE
-- ============================================================================

CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    filters JSONB NOT NULL DEFAULT '{}',
    notify_on_new BOOLEAN DEFAULT FALSE,
    result_count INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_notify ON saved_searches(notify_on_new) WHERE notify_on_new = TRUE;
CREATE INDEX idx_saved_searches_created ON saved_searches(created_at DESC);

-- ============================================================================
-- SEARCH ANALYTICS TABLE
-- ============================================================================

CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    search_type VARCHAR(50) NOT NULL,
    filters_used JSONB NOT NULL DEFAULT '{}',
    results_count INTEGER NOT NULL DEFAULT 0,
    click_through_rate DECIMAL(5, 2),
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_analytics_user ON search_analytics(user_id);
CREATE INDEX idx_search_analytics_type ON search_analytics(search_type);
CREATE INDEX idx_search_analytics_created ON search_analytics(created_at DESC);

-- ============================================================================
-- POPULAR SEARCHES TABLE
-- ============================================================================

CREATE TABLE popular_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    search_term VARCHAR(255) NOT NULL,
    search_type VARCHAR(50) NOT NULL,
    
    search_count INTEGER NOT NULL DEFAULT 1,
    last_searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unique_users INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT popular_searches_unique UNIQUE (search_term, search_type)
);

CREATE INDEX idx_popular_searches_term ON popular_searches(search_term);
CREATE INDEX idx_popular_searches_count ON popular_searches(search_count DESC);
CREATE INDEX idx_popular_searches_updated ON popular_searches(last_searched_at DESC);

-- ============================================================================
-- EDUCATION LEVELS TABLE
-- ============================================================================

CREATE TABLE education_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    level VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_education_levels_level ON education_levels(level);

-- Seed education levels
INSERT INTO education_levels (id, level, name, display_order) VALUES
('e1000000-0000-0000-0000-000000000001', 'high_school', 'High School', 1),
('e1000000-0000-0000-0000-000000000002', 'bachelors', 'Bachelors Degree', 2),
('e1000000-0000-0000-0000-000000000003', 'masters', 'Masters Degree', 3),
('e1000000-0000-0000-0000-000000000004', 'doctorate', 'Doctorate / PhD', 4),
('e1000000-0000-0000-0000-000000000005', 'post_doctorate', 'Post Doctorate', 5);

-- ============================================================================
-- OCCUPATION CATEGORIES TABLE
-- ============================================================================

CREATE TABLE occupation_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_occupation_categories_slug ON occupation_categories(slug);

-- Seed occupation categories
INSERT INTO occupation_categories (id, slug, name, display_order) VALUES
('o1000000-0000-0000-0000-000000000001', 'it_software', 'IT / Software', 1),
('o1000000-0000-0000-0000-000000000002', 'doctor', 'Doctor / Medical', 2),
('o1000000-0000-0000-0000-000000000003', 'engineer', 'Engineering', 3),
('o1000000-0000-0000-0000-000000000004', 'teacher', 'Teaching / Education', 4),
('o1000000-0000-0000-0000-000000000005', 'business', 'Business / Self Employed', 5),
('o1000000-0000-0000-0000-000000000006', 'banking', 'Banking / Finance', 6),
('o1000000-0000-0000-0000-000000000007', 'government', 'Government / Civil Services', 7),
('o1000000-0000-0000-0000-000000000008', 'lawyer', 'Law / Legal', 8),
('o1000000-0000-0000-0000-000000000009', 'manager', 'Management / Corporate', 9),
('o1000000-0000-0000-0000-000000000010', 'other', 'Other', 99);

-- ============================================================================
-- PROFILE SEARCH INDEX (for full-text search without Elasticsearch)
-- ============================================================================

CREATE INDEX idx_profiles_religion ON profiles(religion);
CREATE INDEX idx_profiles_caste ON profiles(caste) WHERE caste IS NOT NULL;
CREATE INDEX idx_profiles_mother_tongue ON profiles(mother_tongue) WHERE mother_tongue IS NOT NULL;
CREATE INDEX idx_profiles_education ON profiles(highest_education) WHERE highest_education IS NOT NULL;
CREATE INDEX idx_profiles_occupation ON profiles(occupation) WHERE occupation IS NOT NULL;
CREATE INDEX idx_profiles_income ON profiles(annual_income) WHERE annual_income IS NOT NULL;
CREATE INDEX idx_profiles_height ON profiles(height_cm) WHERE height_cm IS NOT NULL;
CREATE INDEX idx_profiles_age_composite ON profiles(gender, age) WHERE age IS NOT NULL;

-- ============================================================================
-- FUNCTION: Increment search count
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_search_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE popular_searches 
    SET 
        search_count = search_count + 1,
        last_searched_at = CURRENT_TIMESTAMP
    WHERE search_term = NEW.search_term AND search_type = NEW.search_type;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_increment_search_count
    AFTER INSERT ON search_analytics
    FOR EACH ROW EXECUTE FUNCTION increment_search_count();

-- ============================================================================
-- TRIGGER: Update updated_at
-- ============================================================================

CREATE TRIGGER update_saved_searches_updated_at
    BEFORE UPDATE ON saved_searches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popular_searches_updated_at
    BEFORE UPDATE ON popular_searches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
