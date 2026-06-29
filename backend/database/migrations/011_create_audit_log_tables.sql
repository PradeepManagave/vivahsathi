-- Migration: 011_create_audit_log_tables.sql
-- Description: Creates additional audit log tables for centralized audit service

-- Auth audit logs
CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    target_id UUID,
    target_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_action ON auth_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_created_at ON auth_audit_logs(created_at);

-- Profile audit logs
CREATE TABLE IF NOT EXISTS profile_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    target_id UUID,
    target_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profile_audit_logs_user_id ON profile_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_audit_logs_action ON profile_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_profile_audit_logs_created_at ON profile_audit_logs(created_at);

-- Payment audit logs
CREATE TABLE IF NOT EXISTS payment_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    target_id UUID,
    target_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_user_id ON payment_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_action ON payment_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_created_at ON payment_audit_logs(created_at);

-- Add missing columns to existing admin_audit_logs if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_audit_logs' AND column_name = 'user_agent') THEN
        ALTER TABLE admin_audit_logs ADD COLUMN user_agent TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_audit_logs' AND column_name = 'target_id') THEN
        ALTER TABLE admin_audit_logs ADD COLUMN target_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_audit_logs' AND column_name = 'target_type') THEN
        ALTER TABLE admin_audit_logs ADD COLUMN target_type VARCHAR(50);
    END IF;
END $$;

-- Add missing columns to centre_activity_logs if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'centre_activity_logs' AND column_name = 'user_agent') THEN
        ALTER TABLE centre_activity_logs ADD COLUMN user_agent TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'centre_activity_logs' AND column_name = 'target_id') THEN
        ALTER TABLE centre_activity_logs ADD COLUMN target_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'centre_activity_logs' AND column_name = 'target_type') THEN
        ALTER TABLE centre_activity_logs ADD COLUMN target_type VARCHAR(50);
    END IF;
END $$;

-- Add missing columns to kyc_verification_logs if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kyc_verification_logs' AND column_name = 'user_agent') THEN
        ALTER TABLE kyc_verification_logs ADD COLUMN user_agent TEXT;
    END IF;
END $$;

-- Add index for centre_id on users table (for query optimization)
CREATE INDEX IF NOT EXISTS idx_users_centre_id ON users(centre_id) WHERE centre_id IS NOT NULL;
