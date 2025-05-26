-- Basic authentication functions for MVP

-- Simple register function
CREATE OR REPLACE FUNCTION auth.register(email TEXT, password TEXT)
RETURNS JSON AS $$
DECLARE
    user_id UUID;
    jwt_secret TEXT;
    token TEXT;
BEGIN

    -- Insert new user
    INSERT INTO auth.users (email, password_hash)
    VALUES (LOWER(TRIM(email)), crypt(password, gen_salt('bf')))
    RETURNING id INTO user_id;
    
    -- Get JWT secret
    SELECT secret INTO jwt_secret
    FROM auth.secrets
    WHERE is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Generate JWT token
    SELECT sign(
        json_build_object(
            'user_id', user_id,
            'email', LOWER(TRIM(email)),
            'role', 'app_user',
            'exp', extract(epoch from now() + interval '24 hours')::integer
        ),
        jwt_secret
    ) INTO token;
    
    RETURN json_build_object(
        'success', true,
        'token', token,
        'user_id', user_id,
        'email', LOWER(TRIM(email))
    );
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Email already exists'
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Registration failed'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple login function
CREATE OR REPLACE FUNCTION auth.login(email TEXT, password TEXT)
RETURNS JSON AS $$
DECLARE
    user_record auth.users;
    jwt_secret TEXT;
    token TEXT;
BEGIN
    -- Get user
    SELECT * INTO user_record
    FROM auth.users
    WHERE users.email = LOWER(TRIM(login.email));
    
    -- Check credentials
    IF user_record IS NULL OR user_record.password_hash != crypt(password, user_record.password_hash) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid credentials'
        );
    END IF;
    
    -- Get JWT secret
    SELECT secret INTO jwt_secret
    FROM auth.secrets
    WHERE is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Generate JWT token
    SELECT sign(
        json_build_object(
            'user_id', user_record.id,
            'email', user_record.email,
            'role', 'app_user',
            'exp', extract(epoch from now() + interval '24 hours')::integer
        ),
        jwt_secret
    ) INTO token;
    
    RETURN json_build_object(
        'success', true,
        'token', token,
        'user_id', user_record.id,
        'email', user_record.email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Verify JWT token function
CREATE OR REPLACE FUNCTION auth.verify_jwt(token TEXT)
RETURNS JSON AS $$
DECLARE
    jwt_secret TEXT;
    payload JSON;
    user_record auth.users;
BEGIN
    -- Get JWT secret
    SELECT secret INTO jwt_secret
    FROM auth.secrets
    WHERE is_active = TRUE
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Verify and decode token
    SELECT verify(token, jwt_secret) INTO payload;
    
    -- Check if token is valid
    IF payload IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid token'
        );
    END IF;
    
    -- Check expiration
    IF (payload->>'exp')::integer < extract(epoch from now())::integer THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Token expired'
        );
    END IF;
    
    -- Get user to ensure they still exist
    SELECT * INTO user_record
    FROM auth.users
    WHERE id = (payload->>'user_id')::UUID;
    
    IF user_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'User not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'user_id', user_record.id,
        'email', user_record.email,
        'role', payload->>'role'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Token verification failed'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auth.register(TEXT, TEXT) TO web_anon;
GRANT EXECUTE ON FUNCTION auth.login(TEXT, TEXT) TO web_anon;
