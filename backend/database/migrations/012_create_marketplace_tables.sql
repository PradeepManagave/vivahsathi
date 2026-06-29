-- Migration: 012_create_marketplace_tables.sql
-- Description: Creates marketplace tables for vendors, classifieds, and categories

CREATE TABLE IF NOT EXISTS marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('vendor', 'classified')),
    description TEXT,
    icon VARCHAR(255),
    parent_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_categories_type ON marketplace_categories(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_parent ON marketplace_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_slug ON marketplace_categories(slug);

CREATE TABLE IF NOT EXISTS marketplace_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    business_name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    category_id UUID NOT NULL REFERENCES marketplace_categories(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    long_description TEXT,
    location VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    price_range VARCHAR(50),
    images JSONB DEFAULT '[]',
    services JSONB DEFAULT '[]',
    working_hours JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_vendors_category ON marketplace_vendors(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_vendors_location ON marketplace_vendors(location);
CREATE INDEX IF NOT EXISTS idx_marketplace_vendors_rating ON marketplace_vendors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_vendors_slug ON marketplace_vendors(slug);
CREATE INDEX IF NOT EXISTS idx_marketplace_vendors_user ON marketplace_vendors(user_id);

CREATE TABLE IF NOT EXISTS marketplace_classifieds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES marketplace_categories(id) ON DELETE RESTRICT,
    location VARCHAR(200) NOT NULL,
    price VARCHAR(50) NOT NULL,
    posted_by VARCHAR(100) NOT NULL,
    posted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    images JSONB DEFAULT '[]',
    condition VARCHAR(50),
    negotiable BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_classifieds_category ON marketplace_classifieds(category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_classifieds_location ON marketplace_classifieds(location);
CREATE INDEX IF NOT EXISTS idx_marketplace_classifieds_user ON marketplace_classifieds(posted_by_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_classifieds_created ON marketplace_classifieds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_classifieds_featured ON marketplace_classifieds(is_featured) WHERE is_featured = true;

CREATE TABLE IF NOT EXISTS marketplace_vendor_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES marketplace_vendors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_inquiries_vendor ON marketplace_vendor_inquiries(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_inquiries_user ON marketplace_vendor_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_inquiries_read ON marketplace_vendor_inquiries(is_read) WHERE is_read = false;

-- Seed default categories
INSERT INTO marketplace_categories (name, slug, type, description, display_order) VALUES
    ('Wedding Planners', 'wedding-planners', 'vendor', 'Professional wedding planning services', 1),
    ('Photographers', 'photographers', 'vendor', 'Wedding photography and videography', 2),
    ('Caterers', 'caterers', 'vendor', 'Wedding catering and food services', 3),
    ('Venues', 'venues', 'vendor', 'Marriage halls and venues', 4),
    ('Makeup Artists', 'makeup-artists', 'vendor', 'Bridal makeup and beauty services', 5),
    ('Jewellers', 'jewellers', 'vendor', 'Wedding jewellery and ornaments', 6),
    ('Transport', 'transport', 'classified', 'Vehicles for sale and transport services', 1),
    ('Electronics', 'electronics', 'classified', 'Electronics and gadgets', 2),
    ('Furniture', 'furniture', 'classified', 'Home furniture and decor', 3),
    ('Services', 'services', 'classified', 'Professional services offered', 4)
ON CONFLICT (slug) DO NOTHING;
