-- ============================================================
-- Migration: 009_create_super_admin_tables.sql
-- Description: Super Admin panel support tables
-- ============================================================

-- Static Pages (CMS)
CREATE TABLE IF NOT EXISTS static_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_hi VARCHAR(200),
    title_mr VARCHAR(200),
    content TEXT,
    content_hi TEXT,
    content_mr TEXT,
    meta_title VARCHAR(200),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    page_type VARCHAR(50) NOT NULL DEFAULT 'custom' CHECK (page_type IN ('custom', 'about', 'contact', 'privacy', 'terms', 'faq', 'help')),
    display_order INT DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_page_slug ON static_pages(slug);
CREATE INDEX idx_page_status ON static_pages(status);
CREATE INDEX idx_page_type ON static_pages(page_type);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    link_type VARCHAR(20) DEFAULT 'external' CHECK (link_type IN ('external', 'internal', 'profile', 'search')),
    target VARCHAR(20) DEFAULT 'all' CHECK (target IN ('all', 'free', 'premium', 'male', 'female')),
    position VARCHAR(20) NOT NULL DEFAULT 'homepage' CHECK (position IN ('homepage', 'sidebar', 'footer', 'popup', 'banner')),
    campaign_name VARCHAR(100),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    click_count INT DEFAULT 0,
    impression_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_banner_position ON banners(position);
CREATE INDEX idx_banner_active ON banners(is_active);
CREATE INDEX idx_banner_dates ON banners(start_date, end_date) WHERE is_active = TRUE;

-- Platform Settings
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'email', 'sms', 'payment', 'tax', 'advertisement', 'seo', 'social')),
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_settings_category ON platform_settings(category);

-- Admin Activity Log
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_action ON admin_activity_logs(action);
CREATE INDEX idx_admin_activity_resource ON admin_activity_logs(resource_type, resource_id);
CREATE INDEX idx_admin_activity_created ON admin_activity_logs(created_at DESC);

-- Member Activity Log
CREATE TABLE IF NOT EXISTS member_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_member_activity_user ON member_activity_logs(user_id);
CREATE INDEX idx_member_activity_action ON member_activity_logs(action);
CREATE INDEX idx_member_activity_created ON member_activity_logs(created_at DESC);

-- Franchise Commission Ledger
CREATE TABLE IF NOT EXISTS franchise_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    commission_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'approved', 'paid', 'disputed')),
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_amount DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_commission_franchise ON franchise_commissions(franchise_id);
CREATE INDEX idx_commission_status ON franchise_commissions(status);
CREATE INDEX idx_commission_period ON franchise_commissions(period_start, period_end);

-- Create triggers
CREATE TRIGGER tr_page_updated
    BEFORE UPDATE ON static_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_banner_updated
    BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_settings_updated
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_commission_updated
    BEFORE UPDATE ON franchise_commissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
