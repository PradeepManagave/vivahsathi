-- ============================================================
-- Migration: 010_create_franchise_centre_tables.sql
-- Description: Franchise Centre module support tables
-- ============================================================

-- Appointment Slots
CREATE TABLE IF NOT EXISTS appointment_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES users(id),
    slot_type VARCHAR(50) NOT NULL DEFAULT 'video_kyc' CHECK (slot_type IN ('video_kyc', 'profile_setup', 'renewal', 'counseling', 'general')),
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_bookings INT DEFAULT 1,
    current_bookings INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_slot_centre ON appointment_slots(centre_id);
CREATE INDEX idx_slot_staff ON appointment_slots(staff_id);
CREATE INDEX idx_slot_date ON appointment_slots(slot_date);
CREATE INDEX idx_slot_available ON appointment_slots(is_available);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL REFERENCES appointment_slots(id) ON DELETE CASCADE,
    member_id UUID REFERENCES users(id),
    member_name VARCHAR(200),
    member_phone VARCHAR(20),
    member_email VARCHAR(100),
    appointment_type VARCHAR(50) NOT NULL CHECK (appointment_type IN ('video_kyc', 'profile_setup', 'renewal', 'counseling', 'general')),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT DEFAULT 30,
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointment_member ON appointments(member_id);
CREATE INDEX idx_appointment_slot ON appointments(slot_id);
CREATE INDEX idx_appointment_status ON appointments(status);
CREATE INDEX idx_appointment_date ON appointments(scheduled_at);

-- Centre Staff
CREATE TABLE IF NOT EXISTS centre_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'counselor' CHECK (role IN ('counselor', 'coordinator', 'manager', 'data_entry')),
    permissions JSONB DEFAULT '[]'::jsonb,
    is_head BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    hired_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, centre_id)
);

CREATE INDEX idx_staff_centre ON centre_staff(centre_id);
CREATE INDEX idx_staff_user ON centre_staff(user_id);
CREATE INDEX idx_staff_active ON centre_staff(is_active);

-- Approval Requests (from Centre to Site Admin)
CREATE TABLE IF NOT EXISTS centre_approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('member_registration', 'profile_update', 'photo_approval', 'kyc_verification', 'membership_change', 'member_deletion')),
    reference_id UUID,
    member_id UUID REFERENCES users(id),
    old_values JSONB,
    new_values JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_approval_centre ON centre_approval_requests(centre_id);
CREATE INDEX idx_approval_status ON centre_approval_requests(status);
CREATE INDEX idx_approval_type ON centre_approval_requests(request_type);
CREATE INDEX idx_approval_member ON centre_approval_requests(member_id);
CREATE INDEX idx_approval_created ON centre_approval_requests(created_at DESC);

-- Walk-in Member Registrations (pending verification)
CREATE TABLE IF NOT EXISTS walkin_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    registered_by UUID NOT NULL REFERENCES users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    date_of_birth DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    religion VARCHAR(100),
    caste VARCHAR(100),
    education VARCHAR(200),
    occupation VARCHAR(200),
    city VARCHAR(100),
    photo_url VARCHAR(500),
    form_data JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'user_created')),
    approval_request_id UUID REFERENCES centre_approval_requests(id),
    user_id UUID REFERENCES users(id),
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_walkin_centre ON walkin_registrations(centre_id);
CREATE INDEX idx_walkin_status ON walkin_registrations(status);
CREATE INDEX idx_walkin_phone ON walkin_registrations(phone);

-- Commission Ledger (per payment)
CREATE TABLE IF NOT EXISTS commission_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    franchise_id UUID REFERENCES franchises(id),
    payment_id UUID REFERENCES payments(id),
    member_id UUID REFERENCES users(id),
    gross_amount DECIMAL(12,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    period_month DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'paid', 'disputed')),
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_commission_centre ON commission_ledger(centre_id);
CREATE INDEX idx_commission_period ON commission_ledger(period_month);
CREATE INDEX idx_commission_status ON commission_ledger(status);

-- Triggers
CREATE TRIGGER tr_slot_updated
    BEFORE UPDATE ON appointment_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_appointment_updated
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_staff_updated
    BEFORE UPDATE ON centre_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_approval_updated
    BEFORE UPDATE ON centre_approval_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_walkin_updated
    BEFORE UPDATE ON walkin_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
