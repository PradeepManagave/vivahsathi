-- ============================================================
-- Seed: Geo Data - India with Maharashtra
-- Description: Seed geographic data for India and Maharashtra
-- Created: 2026-03-26
-- ============================================================

BEGIN;

-- ============================================================================
-- COUNTRIES
-- ============================================================================

INSERT INTO geo_data (
    id,
    location_type,
    name,
    name_local,
    code,
    iso_code,
    parent_id,
    level,
    is_active,
    is_verified,
    created_at,
    updated_at
) VALUES
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- India UUID
    'country',
    'India',
    'भारत',
    'IN',
    'IND',
    NULL,
    0,
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    uuid_generate_v4(),
    'country',
    'United States',
    NULL,
    'US',
    'USA',
    NULL,
    0,
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    uuid_generate_v4(),
    'country',
    'United Kingdom',
    NULL,
    'GB',
    'GBR',
    NULL,
    0,
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    uuid_generate_v4(),
    'country',
    'Canada',
    NULL,
    'CA',
    'CAN',
    NULL,
    0,
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    uuid_generate_v4(),
    'country',
    'Australia',
    NULL,
    'AU',
    'AUS',
    NULL,
    0,
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================================
-- STATES - Maharashtra
-- ============================================================================

INSERT INTO geo_data (
    id,
    location_type,
    name,
    name_local,
    code,
    parent_id,
    level,
    is_active,
    is_verified,
    created_at,
    updated_at
) VALUES
(
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', -- Maharashtra UUID
    'state',
    'Maharashtra',
    'महाराष्ट्र',
    'MH',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    1,
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================================
-- DISTRICTS - Maharashtra
-- ============================================================================

INSERT INTO geo_data (
    id,
    location_type,
    name,
    name_local,
    code,
    parent_id,
    level,
    is_active,
    is_verified,
    created_at,
    updated_at
) VALUES
-- Mumbai & Suburbs
(uuid_generate_v4(), 'district', 'Mumbai City', 'मुंबई शहर', 'MUM-CITY', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Mumbai Suburban', 'मुंबई उपनगर', 'MUM-URBN', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Thane', 'ठाणे', 'THN', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Palghar', 'पालघर', 'PLG', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Raigad', 'रायगड', 'RGD', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Pune Region
(uuid_generate_v4(), 'district', 'Pune', 'पुणे', 'PUN', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Satara', 'सातारा', 'SAT', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Sangli', 'सांगली', 'SNG', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Solapur', 'सोलापूर', 'SLP', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Kolhapur', 'कोल्हापूर', 'KOP', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Nashik Region
(uuid_generate_v4(), 'district', 'Nashik', 'नाशिक', 'NSK', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Ahmednagar', 'अहमदनगर', 'AHN', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Jalgaon', 'जळगाव', 'JLG', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Dhule', 'धुळे', 'DHL', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Nandurbar', 'नंदुरबार', 'NDB', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Aurangabad Region
(uuid_generate_v4(), 'district', 'Aurangabad', 'औरंगाबाद', 'ARB', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Jalna', 'जालना', 'JLN', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Beed', 'बीड', 'BED', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Parbhani', 'परभणी', 'PRB', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Hingoli', 'हिंगोली', 'HNG', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Nagpur Region
(uuid_generate_v4(), 'district', 'Nagpur', 'नागपूर', 'NGP', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Amravati', 'अमरावती', 'AMR', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Wardha', 'वर्धा', 'WRD', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Washim', 'वाशिम', 'WSH', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Buldhana', 'बुलढाणा', 'BLD', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Latur Region
(uuid_generate_v4(), 'district', 'Latur', 'लातूर', 'LTR', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Osmanabad', 'उस्मानाबाद', 'OSM', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Nanded', 'नांदेड', 'NDN', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'district', 'Akola', 'अकोला', 'AKL', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENTURRENT_AT,
    CURRENT_TIMESTAMP
),
(uuid_generate_v4(), 'district', 'Yavatmal', 'यवतमाळ', 'YVT', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;
