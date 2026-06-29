-- ============================================================
-- Migration: 007_create_video_kyc_tables.sql
-- Description: Video KYC verification system
-- ============================================================

-- Video KYC Sessions
CREATE TABLE IF NOT EXISTS video_kyc_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL DEFAULT 'video_call' CHECK (session_type IN ('video_call', 'video_verification')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'failed', 'cancelled', 'no_show')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expiry_minutes INT DEFAULT 30,
    room_id VARCHAR(100),
    room_url VARCHAR(500),
    recording_url VARCHAR(500),
    verification_score INT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kyc_session_user ON video_kyc_sessions(user_id);
CREATE INDEX idx_kyc_session_status ON video_kyc_sessions(status);
CREATE INDEX idx_kyc_session_scheduled ON video_kyc_sessions(scheduled_at);

-- Video KYC Evaluations (Admin review)
CREATE TABLE IF NOT EXISTS video_kyc_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES video_kyc_sessions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    criteria_name VARCHAR(50) NOT NULL,
    criteria_score INT NOT NULL CHECK (criteria_score >= 0 AND criteria_score <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_evaluation_session ON video_kyc_evaluations(session_id);
CREATE INDEX idx_evaluation_reviewer ON video_kyc_evaluations(reviewer_id);

-- KYC Documents
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('aadhaar', 'pan', 'voter_id', 'passport', 'driving_license', 'birth_certificate')),
    document_number VARCHAR(50),
    front_image_url VARCHAR(500) NOT NULL,
    back_image_url VARCHAR(500),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kyc_doc_user ON kyc_documents(user_id);
CREATE INDEX idx_kyc_doc_status ON kyc_documents(verification_status);

-- KYC Verification Logs
CREATE TABLE IF NOT EXISTS kyc_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES kyc_documents(id),
    session_id UUID REFERENCES video_kyc_sessions(id),
    action VARCHAR(50) NOT NULL,
    performed_by UUID REFERENCES users(id),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kyc_log_user ON kyc_verification_logs(user_id);
CREATE INDEX idx_kyc_log_action ON kyc_verification_logs(action);

CREATE TRIGGER tr_kyc_session_updated
    BEFORE UPDATE ON video_kyc_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_kyc_doc_updated
    BEFORE UPDATE ON kyc_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
