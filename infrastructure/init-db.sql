-- Initialize PostGIS extension and baseline configurations
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Baseline schema creation script for production PostgreSQL initialization
COMMENT ON DATABASE skillsentinel_db IS 'Skill-Sentinel Compliance Intelligence Platform Database';
