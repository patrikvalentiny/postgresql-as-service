-- SQL script to create the pgcrypto extension in PostgreSQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Insert a test row with a hashed password
INSERT INTO test_table (name, password)
VALUES ('test_user1', crypt('test_password', gen_salt('bf')))
ON CONFLICT (name) DO NOTHING;

-- Insert a test row with a hashed password
INSERT INTO test_table (name, password)
VALUES ('test_user2', crypt('test_password', gen_salt('bf')))
ON CONFLICT (name) DO NOTHING;

SELECT * FROM test_table;


CREATE OR REPLACE FUNCTION verify_password(
    p_name TEXT,
    p_password TEXT
) RETURNS BOOLEAN 
LANGUAGE plpgsql
AS 
$$
DECLARE
    v_hashed_password TEXT;
BEGIN
    SELECT password INTO v_hashed_password
    FROM test_table
    WHERE name = p_name;

    IF v_hashed_password IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN crypt(p_password, v_hashed_password) = v_hashed_password;
END;
$$;

SELECT verify_password('test_user1', 'test_password') AS is_valid;
SELECT verify_password('test_user1', 'wrong_password') AS is_valid;
SELECT verify_password('test_user2', 'test_password') AS is_valid;
SELECT verify_password('test_user2', 'wrong_password') AS is_valid;
