-- ============================================================
-- Migration: 006_create_notification_tables.sql
-- Description: Push notifications, FCM devices
-- ============================================================

-- Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    title_template VARCHAR(200) NOT NULL,
    body_template TEXT NOT NULL,
    data_schema JSONB DEFAULT '{}'::jsonb,
    channels VARCHAR(50)[] DEFAULT ARRAY['in_app', 'push', 'email']::VARCHAR[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_template_type ON notification_templates(type);
CREATE INDEX idx_template_active ON notification_templates(is_active);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    image_url VARCHAR(500),
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_user ON notifications(user_id);
CREATE INDEX idx_notification_type ON notifications(type);
CREATE INDEX idx_notification_read ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notification_created ON notifications(user_id, created_at DESC);

-- User Devices (FCM tokens)
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    fcm_token VARCHAR(500) NOT NULL,
    device_type VARCHAR(20) CHECK (device_type IN ('ios', 'android', 'web')),
    device_name VARCHAR(100),
    app_version VARCHAR(20),
    os_version VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

CREATE INDEX idx_device_user ON user_devices(user_id);
CREATE INDEX idx_device_fcm ON user_devices(fcm_token);
CREATE INDEX idx_device_active ON user_devices(is_active);

CREATE TRIGGER tr_notification_template_updated
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_device_updated
    BEFORE UPDATE ON user_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
