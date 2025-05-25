-- Authentication schema for MVP

CREATE SCHEMA IF NOT EXISTS auth;

-- Basic users table
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- JWT secrets table
CREATE TABLE IF NOT EXISTS auth.secrets (
    id SERIAL PRIMARY KEY,
    secret TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert default JWT secret
INSERT INTO auth.secrets (secret) 
VALUES ('reallyreallyreallyreallyverysafe')
ON CONFLICT DO NOTHING;

-- Update timestamp function
CREATE OR REPLACE FUNCTION auth.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON auth.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auth.update_updated_at();

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Grant minimal permissions
GRANT USAGE ON SCHEMA auth TO web_anon;
GRANT USAGE ON SCHEMA auth TO app_user;
