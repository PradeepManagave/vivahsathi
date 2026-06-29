-- ============================================================
-- Seed: Notification Templates
-- ============================================================

INSERT INTO notification_templates (name, type, title_template, body_template, channels) VALUES
-- Account & Auth
('welcome_member', 'account', 'Welcome to Heritage Matrimony!', 'Your profile is now live. Start searching for your perfect match today.', ARRAY['in_app', 'push', 'email']),
('email_verified', 'account', 'Email Verified', 'Your email has been successfully verified.', ARRAY['in_app', 'push']),
('phone_verified', 'account', 'Phone Verified', 'Your phone number has been successfully verified.', ARRAY['in_app', 'push']),

-- Profile
('profile_approved', 'profile', 'Profile Approved', 'Your profile has been approved and is now visible to others.', ARRAY['in_app', 'push', 'email']),
('profile_rejected', 'profile', 'Profile Update Required', 'Please update your profile to meet our verification standards.', ARRAY['in_app', 'push', 'email']),
('profile_kyc_approved', 'profile', 'KYC Verified', 'Your KYC verification has been approved.', ARRAY['in_app', 'push', 'email']),
('profile_kyc_rejected', 'profile', 'KYC Verification Failed', 'Your KYC verification was not approved. Please resubmit.', ARRAY['in_app', 'push', 'email']),

-- Interests
('interest_received', 'interest', 'New Interest Received', '{{sender_name}} sent you an interest request', ARRAY['in_app', 'push', 'email']),
('interest_accepted', 'interest', 'Interest Accepted!', '{{receiver_name}} accepted your interest. You can now start chatting!', ARRAY['in_app', 'push', 'email']),
('interest_rejected', 'interest', 'Interest Declined', '{{receiver_name}} did not accept your interest.', ARRAY['in_app', 'push']),
('interest_cancelled', 'interest', 'Interest Cancelled', 'An interest request was cancelled.', ARRAY['in_app', 'push']),

-- Messages
('new_message', 'chat', 'New Message', '{{sender_name}}: {{message_preview}}', ARRAY['in_app', 'push']),

-- Membership
('membership_expiring', 'membership', 'Membership Expiring Soon', 'Your {{plan_name}} membership expires in {{days}} days. Renew now to continue enjoying premium features.', ARRAY['in_app', 'push', 'email']),
('membership_expired', 'membership', 'Membership Expired', 'Your {{plan_name}} membership has expired. Upgrade to continue enjoying premium features.', ARRAY['in_app', 'push', 'email']),
('membership_upgraded', 'membership', 'Membership Upgraded', 'Your membership has been upgraded to {{plan_name}}. Enjoy your new features!', ARRAY['in_app', 'push', 'email']),
('payment_received', 'membership', 'Payment Confirmed', 'Your payment of ₹{{amount}} has been received. Thank you!', ARRAY['in_app', 'push', 'email']),

-- System
('daily_matches', 'reminder', 'New Matches For You', 'We found {{count}} new matches based on your preferences. Check them out!', ARRAY['in_app', 'push', 'email']),
('profile_view', 'engagement', 'Profile Viewed', 'Your profile was viewed by {{count}} new members today.', ARRAY['in_app']),
('weekly_digest', 'digest', 'Weekly Digest', 'Here are this week''s highlights: {{highlights}}', ARRAY['in_app', 'email'])
ON CONFLICT (name) DO NOTHING;
