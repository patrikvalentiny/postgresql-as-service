-- Basic roles setup for MVP

-- Drop existing roles if they exist
DROP ROLE IF EXISTS authenticator;
DROP ROLE IF EXISTS web_anon;
DROP ROLE IF EXISTS app_user;

-- Create anonymous role (no login, minimal privileges)
CREATE ROLE web_anon NOLOGIN;

-- Create authenticated user role
CREATE ROLE app_user NOLOGIN;

-- Create authenticator role (used by PostgREST)
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'mysecretpassword';

-- Grant role memberships
GRANT web_anon TO authenticator;
GRANT app_user TO authenticator;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
