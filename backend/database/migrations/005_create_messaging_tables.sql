-- ============================================================
-- Migration: 005_create_messaging_tables.sql
-- Description: Interest requests, chat messages, notifications
-- ============================================================

-- Interest Requests (Sent/Received)
CREATE TABLE IF NOT EXISTS interest_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

CREATE INDEX idx_interest_sender ON interest_requests(sender_id);
CREATE INDEX idx_interest_receiver ON interest_requests(receiver_id);
CREATE INDEX idx_interest_status ON interest_requests(status);
CREATE INDEX idx_interest_created ON interest_requests(created_at DESC);

-- Chat Conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview VARCHAR(200),
    participant_1_unread INT DEFAULT 0,
    participant_2_unread INT DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_by UUID REFERENCES users(id),
    blocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_1, participant_2)
);

CREATE INDEX idx_conversation_p1 ON chat_conversations(participant_1);
CREATE INDEX idx_conversation_p2 ON chat_conversations(participant_2);
CREATE INDEX idx_conversation_updated ON chat_conversations(updated_at DESC);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'voice', 'document', 'system')),
    media_url VARCHAR(500),
    media_thumbnail VARCHAR(500),
    reply_to_id UUID REFERENCES chat_messages(id),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_message_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_message_sender ON chat_messages(sender_id);
CREATE INDEX idx_message_created ON chat_messages(created_at DESC);
CREATE INDEX idx_message_unread ON chat_messages(conversation_id, is_read) WHERE is_read = FALSE;

-- Report Profiles
CREATE TABLE IF NOT EXISTS profile_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('fake_profile', 'inappropriate', 'spam', 'harassment', 'wrong_age', 'wrong_religion', 'other')),
    description TEXT,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    action_taken VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_report_reporter ON profile_reports(reporter_id);
CREATE INDEX idx_report_reported ON profile_reports(reported_user_id);
CREATE INDEX idx_report_status ON profile_reports(status);

-- Blocked Users
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_block_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_block_blocked ON blocked_users(blocked_id);

-- ============================================================
-- Trigger: Update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_interest_updated
    BEFORE UPDATE ON interest_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_conversation_updated
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_message_updated
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_report_updated
    BEFORE UPDATE ON profile_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
