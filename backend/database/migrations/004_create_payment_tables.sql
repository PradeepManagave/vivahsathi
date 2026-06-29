-- ============================================================
// Migration: 004_create_payment_tables.sql
-- Description: Create payment and membership related tables
-- Created: 2026-03-26
-- ============================================================

BEGIN;

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES membership_plans(id),
    prepaid_pack_id UUID REFERENCES prepaid_packs(id),
    
    amount DECIMAL(10, 2) NOT NULL,
    base_amount DECIMAL(10, 2) NOT NULL,
    gst_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')
    ),
    
    payment_method VARCHAR(30),
    
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    
    offline_payment_mode VARCHAR(30),
    offline_transaction_ref VARCHAR(100),
    offline_notes TEXT,
    collected_by UUID REFERENCES users(id),
    franchise_centre_id UUID REFERENCES franchise_centres(id),
    
    refund_id VARCHAR(100),
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,
    refunded_by UUID REFERENCES users(id),
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    failure_reason TEXT,
    gateway_response JSONB,
    
    coupon_id UUID REFERENCES coupons(id),
    
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_plan ON payments(plan_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at DESC);
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_paid_at ON payments(paid_at) WHERE paid_at IS NOT NULL;

-- ============================================================================
-- PREPAID PACKS TABLE
-- ============================================================================

CREATE TABLE prepaid_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    contacts INTEGER NOT NULL CHECK (contacts > 0),
    validity_days INTEGER NOT NULL CHECK (validity_days > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    discounted_price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    benefits JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prepaid_packs_active ON prepaid_packs(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_prepaid_packs_order ON prepaid_packs(display_order);

-- Seed prepaid packs
INSERT INTO prepaid_packs (id, name, slug, description, contacts, validity_days, price, benefits) VALUES
('pp100000-0000-0000-0000-000000000001', 'Starter Pack', 'starter', 'View 25 contact details', 25, 30, 299, '["View 25 contacts", "30 days validity", "SMS notifications"]'),
('pp100000-0000-0000-0000-000000000002', 'Basic Pack', 'basic', 'View 50 contact details', 50, 60, 499, '["View 50 contacts", "60 days validity", "SMS & Email notifications"]'),
('pp100000-0000-0000-0000-000000000003', 'Premium Pack', 'premium', 'View 100 contact details', 100, 90, 899, '["View 100 contacts", "90 days validity", "Priority support"]'),
('pp100000-0000-0000-0000-000000000004', 'Unlimited Pack', 'unlimited', 'View 200 contact details', 200, 180, 1499, '["View 200 contacts", "180 days validity", "Dedicated support"]');

-- ============================================================================
-- COUPONS TABLE
-- ============================================================================

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(10, 2) NOT NULL,
    
    min_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount DECIMAL(10, 2),
    
    max_uses INTEGER,
    uses INTEGER DEFAULT 0,
    
    valid_from TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    applicable_plans UUID[],
    applicable_users UUID[],
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_coupons_expires ON coupons(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- USER PREPAID BALANCES TABLE
-- ============================================================================

CREATE TABLE user_prepaid_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    balance_contacts INTEGER DEFAULT 0,
    balance_messages INTEGER DEFAULT 0,
    
    expiry_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT user_prepaid_balances_balance_check CHECK (balance_contacts >= 0)
);

CREATE INDEX idx_prepaid_balance_user ON user_prepaid_balances(user_id);
CREATE INDEX idx_prepaid_balance_expiry ON user_prepaid_balances(expiry_date) WHERE expiry_date IS NOT NULL;

-- ============================================================================
-- PREPAID TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE prepaid_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
    amount INTEGER NOT NULL,
    
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    
    description VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prepaid_txn_user ON prepaid_transactions(user_id);
CREATE INDEX idx_prepaid_txn_created ON prepaid_transactions(created_at DESC);

-- ============================================================================
-- MEMBERSHIP UPGRADE LOG TABLE
-- ============================================================================

CREATE TABLE membership_upgrade_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    from_plan_id UUID REFERENCES membership_plans(id),
    to_plan_id UUID REFERENCES membership_plans(id),
    
    payment_id UUID REFERENCES payments(id),
    
    upgrade_type VARCHAR(20) NOT NULL CHECK (upgrade_type IN ('new', 'renewal', 'upgrade', 'downgrade', 'cancel')),
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_upgrade_logs_user ON membership_upgrade_logs(user_id);
CREATE INDEX idx_upgrade_logs_created ON membership_upgrade_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prepaid_packs_updated_at
    BEFORE UPDATE ON prepaid_packs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_prepaid_balances_updated_at
    BEFORE UPDATE ON user_prepaid_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
