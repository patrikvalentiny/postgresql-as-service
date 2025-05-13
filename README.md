# PostgreSQL: Exploring One Database for (Almost) Everything

## Overview

This project investigates how PostgreSQL, with its rich ecosystem of extensions and features, can replace many specialized backend tools and services. Inspired by [this video](https://www.youtube.com/watch?v=3JW732GrMdg), we explore practical use cases where PostgreSQL can serve as more than just a relational database.

## *Possible* Use Cases Explored

- **Handling Unstructured Data:**  
  Use JSONB columns to store and query dynamic, object-like data, providing NoSQL-like flexibility within PostgreSQL.

- **Cron Jobs:**  
  Schedule SQL statements to run at regular intervals using the `pg_cron` extension, replacing external cron services.

- **In-Memory Cache:**  
  Create a "poor man's Redis" by using unlogged tables (for speed, at the cost of durability) and shared buffers to keep data in RAM. Use `pg_cron` for cache expiration.

- **Full-Text Search:**  
  Leverage built-in support for full-text search using `tsvector` and GIN indexes, enabling ranking and efficient querying—potentially replacing services like Algolia or Elasticsearch.

- **GraphQL API:**  
  Expose your database as a GraphQL API using the `pg_graphql` extension, allowing direct, flexible queries from any client without extra servers.

- **Real-Time Applications / Sync Layer:**  
  Integrate with tools like ElectricSQL to keep frontend data in sync with the database, reducing the need for custom websocket or polling logic.

- **Authentication:**  
  Implement authentication using `pgcrypto` (for password hashing and salts) and `pgjwt` (for JWT session tokens). Combine with Row Level Security (RLS) to enforce per-user data access policies.

- **Analytics / Time Series Database:**  
  Use the `pg_mooncake` extension for efficient time series storage and analytics, with support for columnar tables and DuckDB execution. Integrate with visualization tools like Grafana.

- **RESTful API:**  
  Instantly create a RESTful API with PostgREST, exposing your database over HTTP with JSON responses, filtering, pagination, and authentication.

## Methodology

- For each use case, I will implement a sample solution using the relevant PostgreSQL feature or extension.
- Compare the PostgreSQL-based approach to traditional specialized tool.

## Caution

> "The road to hell is paved with good intentions"
>
> Just because you can do something in PostgreSQL doesn't mean you should.  

## Analysis & Results
### pgcrypto
The pgcrypto module provides cryptographic functions for PostgreSQL.
Examples in the `src/sql/extensions/pgcrypto.sql` show how it can be setup and basic usage.
#### Setup 
This module is considered “trusted”, that is, it can be installed by non-superusers who have CREATE privilege on the current database.
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```
#### Password Hashing
The `crypt(password text, salt text)` method allows to securely store passwords with a salt in order to prevent duplicates and improve security
Salt generation is handled via `gen_salt(type text [, iter_count integer ])`. This method allows to use different algorithms depending on the required security / performance

#### Password verification
`crypt(plaintext password, v_hashed_password)` will return a hash with the same salt as the hashed password.

To be able to check the password easily we can create a function that can be reused 


```sql
CREATE OR REPLACE FUNCTION verify_password(
    user_identifier TEXT,
    plain_password TEXT
) RETURNS BOOLEAN 
LANGUAGE plpgsql
AS 
$$
DECLARE
    hashed_password TEXT;
BEGIN
    SELECT password INTO hashed_password
    FROM test_table
    WHERE username = user_identifier OR email = user_identifier OR user_id = uuid(user_identifier);

    IF hashed_password IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN crypt(plain_password, hashed_password) = hashed_password;
END;
$$;
```

### pgjwt
The pgjwt extension provides functions to create and verify JSON Web Tokens (JWT) directly in PostgreSQL.

#### Setup
Install the extension (requires superuser):
```sql
CREATE EXTENSION IF NOT EXISTS pgjwt;
```

#### Creating a JWT
Use the `sign` function to generate a JWT from a JSON payload and secret key:
```sql
SELECT sign(
  '{"sub": "user123", "role": "admin"}',
  'your_secret_key'
) AS jwt_token;
```

You can also include standard claims like `iat` (issued at) and `exp` (expiration):
```sql
SELECT sign(
  json_build_object(
    'sub', 'user123',
    'role', 'admin',
    'iat', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::text,
    'exp', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP + INTERVAL '1 hour')::text
  ),
  'your_secret_key'
) AS jwt_token;
```



#### Verifying a JWT
Use the `verify` function to check and decode a JWT:
```sql
SELECT verify(
  'jwt_token_here',
  'your_secret_key'
) AS payload;
```

## Conclusion

TBD

## References

- [Replace Your Backend with Postgres (YouTube)](https://www.youtube.com/watch?v=3JW732GrMdg)
- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [pg_cron](https://github.com/citusdata/pg_cron)
- [pg_graphql](https://github.com/supabase/pg_graphql)
- [ElectricSQL](https://electric-sql.com/)
- [pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html)
- [pgjwt](https://github.com/michelp/pgjwt)
- [pg_mooncake](https://github.com/cwida/pg_mooncake)
- [PostgREST](https://postgrest.org/)

## Appendix