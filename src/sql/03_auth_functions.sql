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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auth.register(TEXT, TEXT) TO web_anon;
GRANT EXECUTE ON FUNCTION auth.login(TEXT, TEXT) TO web_anon;
