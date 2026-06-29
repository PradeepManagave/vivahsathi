-- Migration: 015_create_documents_table.sql
-- Description: Creates documents table for member document uploads

CREATE TABLE IF NOT EXISTS member_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('aadhaar', 'pan', 'passport', 'driving_license', 'voter_id', 'income_proof', 'education_certificate', 'photo', 'other')),
    document_label VARCHAR(100),
    file_key VARCHAR(500) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_member_documents_user ON member_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_member_documents_type ON member_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_member_documents_status ON member_documents(status);
CREATE INDEX IF NOT EXISTS idx_member_documents_reviewer ON member_documents(reviewed_by);
