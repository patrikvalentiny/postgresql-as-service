-- Basic RLS policies for alcohol tracking

-- Enable RLS
ALTER TABLE alc.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE alc.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alc.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE alc.drinks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY users_own_data ON alc.users
    FOR ALL TO app_user
    USING (auth_user_id = (current_setting('request.jwt.claim.user_id', true))::uuid);

-- Sessions: users can see sessions they created or participate in
CREATE POLICY sessions_access ON alc.sessions
    FOR SELECT TO app_user
    USING (
        created_by IN (
            SELECT user_id FROM alc.users 
            WHERE auth_user_id = (current_setting('request.jwt.claim.user_id', true))::uuid
        )
        OR session_id IN (
            SELECT session_id FROM alc.session_participants sp
            JOIN alc.users u ON sp.user_id = u.user_id
            WHERE u.auth_user_id = (current_setting('request.jwt.claim.user_id', true))::uuid
        )
    );

-- Users can only create sessions
CREATE POLICY sessions_insert ON alc.sessions
    FOR INSERT TO app_user
    WITH CHECK (
        created_by IN (
            SELECT user_id FROM alc.users 
            WHERE auth_user_id = (current_setting('request.jwt.claim.user_id', true))::uuid
        )
    );

-- Session participants: basic access control
CREATE POLICY participants_access ON alc.session_participants
    FOR ALL TO app_user
    USING (
        user_id IN (
            SELECT user_id FROM alc.users 
            WHERE auth_user_id = (current_setting('request.jwt.claim.user_id', true))::uuid
        )
        OR session_id IN (
            SELECT session_id FROM alc.sessions
            WHERE created_by IN (
                SELECT user_id FROM alc.users 
                WHERE auth_user_id = (current_setting('request.jwt.claim.user_id', true))::uuid
            )
        )
    );

-- Drinks: users can only see drinks in their sessions
CREATE POLICY drinks_access ON alc.drinks
    FOR ALL TO app_user
    USING (
        session_id IN (
            SELECT session_id FROM alc.sessions s
            WHERE s.created_by IN (
                SELECT user_id FROM alc.users 
                WHERE auth_user_id = (current_setting('request.jwt.claim.user_id', true))::uuid
            )
            OR s.session_id IN (
                SELECT sp.session_id FROM alc.session_participants sp
                JOIN alc.users u ON sp.user_id = u.user_id
                WHERE u.auth_user_id = (current_setting('request.jwt.claim.user_id', true))::uuid
            )
        )
    );

-- Grant basic permissions
GRANT SELECT, INSERT, UPDATE ON alc.users TO app_user;
GRANT SELECT, INSERT, UPDATE ON alc.sessions TO app_user;
GRANT SELECT, INSERT, DELETE ON alc.session_participants TO app_user;
GRANT SELECT ON alc.drink_types TO app_user, web_anon;
GRANT SELECT, INSERT, DELETE ON alc.drinks TO app_user;
GRANT USAGE ON SEQUENCE alc.drink_types_drink_type_id_seq TO app_user;
