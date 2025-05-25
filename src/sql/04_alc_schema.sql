-- Alcohol tracking schema - MVP version

DROP SCHEMA IF EXISTS alc CASCADE;
CREATE SCHEMA alc;

-- Simple users table for app
CREATE TABLE alc.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL CHECK (LENGTH(username) >= 3),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_auth_user UNIQUE (auth_user_id)
);

-- Basic drink types
CREATE TABLE alc.drink_types (
    drink_type_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    alcohol_percentage DECIMAL(5,2) DEFAULT 0 CHECK (alcohol_percentage >= 0 AND alcohol_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simple sessions table
CREATE TABLE alc.sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES alc.users(user_id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session participants (simplified - no invitations)
CREATE TABLE alc.session_participants (
    participant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES alc.sessions(session_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES alc.users(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_session_user UNIQUE (session_id, user_id)
);

-- Basic drinks tracking
CREATE TABLE alc.drinks (
    drink_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES alc.sessions(session_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES alc.users(user_id) ON DELETE CASCADE,
    drink_type_id INTEGER NOT NULL REFERENCES alc.drink_types(drink_type_id),
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
    consumed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic indexes
CREATE INDEX idx_alc_users_auth_user ON alc.users(auth_user_id);
CREATE INDEX idx_alc_sessions_created_by ON alc.sessions(created_by);
CREATE INDEX idx_alc_drinks_session ON alc.drinks(session_id);
CREATE INDEX idx_alc_drinks_user ON alc.drinks(user_id);

-- Insert basic drink types
INSERT INTO alc.drink_types (name, alcohol_percentage) VALUES
    ('Beer', 5.0),
    ('Wine', 12.0),
    ('Vodka', 40.0),
    ('Whiskey', 40.0),
    ('Soda', 0.0),
    ('Water', 0.0);

-- Grant schema usage
GRANT USAGE ON SCHEMA alc TO app_user;
