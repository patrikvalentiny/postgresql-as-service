-- CREATE EXTENSION IF NOT EXISTS pgjwt;
select sign(
    json_build_object(
        'sub', '1234567890',
        'name', 'John Doe',
        'iat', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::text,
        'exp', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP + INTERVAL '1 HOUR')::text
    ),
    'secret'
);
-- select * FROM verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ', 'secret');
-- SELECT now() + INTERVAL '1 HOUR' as expires_at, now() as iat
-- SELECT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) as iat,
    --    EXTRACT(EPOCH FROM CURRENT_TIMESTAMP + INTERVAL '1 HOUR') as expires_at;