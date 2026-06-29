-- Initialize M-Plus Matrimony database
-- This script runs automatically on first PostgreSQL container startup
-- when mounted at /docker-entrypoint-initdb.d/

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create role if not exists (used by application)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mplus_app') THEN
    CREATE ROLE mplus_app WITH LOGIN PASSWORD 'change_me_prod';
    GRANT CONNECT ON DATABASE vivahsathi_prod TO mplus_app;
    GRANT USAGE ON SCHEMA public TO mplus_app;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mplus_app;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mplus_app;
  END IF;
END
$$;
