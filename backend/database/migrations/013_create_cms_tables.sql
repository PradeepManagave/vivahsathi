-- Migration: 013_create_cms_tables.sql
-- Description: Creates CMS tables for content management, testimonials, and success stories

CREATE TABLE IF NOT EXISTS cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_language ON cms_pages(language);

CREATE TABLE IF NOT EXISTS cms_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    avatar_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_testimonials_featured ON cms_testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_cms_testimonials_approved ON cms_testimonials(is_approved) WHERE is_approved = true;

CREATE TABLE IF NOT EXISTS cms_success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image VARCHAR(255),
    bride_name VARCHAR(100),
    groom_name VARCHAR(100),
    wedding_date DATE,
    location VARCHAR(200),
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cms_stories_slug ON cms_success_stories(slug);
CREATE INDEX IF NOT EXISTS idx_cms_stories_featured ON cms_success_stories(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_cms_stories_status ON cms_success_stories(status);

-- Seed default pages
INSERT INTO cms_pages (title, slug, content, status, published_at, is_active) VALUES
    ('About Us', 'about', '<h1>About M-Plus Matrimony</h1><p>Welcome to M-Plus Matrimony, your trusted partner in finding the perfect life partner.</p>', 'published', CURRENT_TIMESTAMP, true),
    ('Contact Us', 'contact', '<h1>Contact Us</h1><p>Get in touch with our team for any queries or support.</p>', 'published', CURRENT_TIMESTAMP, true),
    ('Privacy Policy', 'privacy', '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy outlines how we collect and use your information.</p>', 'published', CURRENT_TIMESTAMP, true),
    ('Terms of Service', 'terms', '<h1>Terms of Service</h1><p>Please read these terms carefully before using our platform.</p>', 'published', CURRENT_TIMESTAMP, true),
    ('FAQ', 'faq', '<h1>Frequently Asked Questions</h1><p>Find answers to commonly asked questions about our services.</p>', 'published', CURRENT_TIMESTAMP, true)
ON CONFLICT (slug) DO NOTHING;
