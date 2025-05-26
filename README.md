# PostgreSQL as a Service

## Introduction

This report examines the feasibility and practicality of using PostgreSQL, together with its ecosystem of extensions and tools, as a comprehensive backend solution for modern applications. The investigation is inspired by the concept of replacing traditional backend services with PostgreSQL. The report documents the methodology, implementation, analysis, and conclusions drawn from building a real-world application using this approach.

## Objectives

- To evaluate PostgreSQL's capabilities beyond its role as a relational database.
- To assess the effectiveness of using PostgREST for exposing database functionality as a RESTful API.
- To analyze the advantages and limitations of this approach in the context of rapid application development.

## Use Cases Explored

- **Authentication:**  
  Implementation of user authentication using PostgreSQL extensions such as `pgcrypto` (for password hashing and salts) and `pgjwt` (for JWT session tokens). Row Level Security (RLS) is employed to enforce per-user data access policies.

- **RESTful API:**  
  Utilization of PostgREST to automatically generate a RESTful API from the database schema, supporting HTTP-based CRUD operations, filtering, pagination, and authentication.

## Methodology

1. **Implementation:**  
   A sample application was developed using PostgreSQL as the primary backend, with tables, views, and functions exposed via PostgREST.

2. **Evaluation:**  
   The application was used to assess the practicality, security, and performance of this approach compared to traditional backend architectures.

3. **Analysis:**  
   The strengths and weaknesses of the solution were analyzed, with particular attention to development speed, maintainability, and security.

## Results and Analysis

### Advantages

- **Rapid Development:**  
  The approach enables fast prototyping and iteration, particularly for user-facing applications. By leveraging PostgREST, developers can expose new tables and views as API endpoints almost instantly, reducing the need for boilerplate backend code. This is especially beneficial in early-stage projects or academic prototypes, where requirements may change frequently.
- **Mature Tooling:**  
  PostgREST is a stable and feature-rich solution, allowing direct access to raw data and computed views. The ability to use PostgreSQL's advanced querying, filtering, and pagination features through the API enables flexible data retrieval without additional backend logic.
- **Database-Centric Logic:**  
  SQL views and functions can encapsulate business logic, reducing client-side complexity and protecting sensitive calculations. For example, aggregate statistics (such as total drinks per user per session) can be computed in the database and exposed as a view or function, ensuring consistency and efficiency.
- **Security:**  
  PostgREST supports JWT verification and role-based access control, integrating with PostgreSQL's RLS to restrict data access at the database level. This means that security policies are enforced close to the data, reducing the risk of accidental data leaks due to misconfigured application logic.
- **Consistency and Maintainability:**  
  Centralizing logic and access control in the database schema simplifies maintenance. Changes to business rules or access policies can be made in one place and immediately reflected in all API consumers.
- **Extensibility:**  
  The approach allows for easy integration of PostgreSQL extensions (such as `pgcrypto` for cryptography or `pgjwt` for authentication), further enhancing the database's capabilities without external dependencies.

### Limitations and Considerations

- **Security Risks:**  
  Direct exposure of database tables requires careful configuration of roles and RLS policies to prevent unauthorized access. Mistakes in RLS or privilege grants can result in data exposure. Rigorous testing and review of security policies are essential.
- **Complex Business Logic:**  
  Some application logic may be more difficult to implement efficiently within SQL or database functions, especially logic that involves complex workflows, external API calls, or asynchronous processing. For example, sending notifications or integrating with third-party services is not straightforward in a database-centric approach.
- **Scalability:**  
  While suitable for many applications, this approach may encounter limitations in highly complex or large-scale systems. As the application grows, the database can become a bottleneck if not properly optimized, and the lack of a traditional backend layer can make it harder to introduce caching, rate limiting, or advanced orchestration.
- **Testing and Debugging:**  
  Debugging issues in SQL functions or RLS policies can be more challenging than in traditional backend code, due to limited tooling and less familiar debugging workflows for many developers.
- **Vendor Lock-in and Portability:**  
  Heavy reliance on PostgreSQL-specific features and extensions may reduce portability to other database systems or cloud providers.
- **Untracked Database Changes:**  
    Direct changes to the database schema (e.g., via migrations or manual edits) can alter app behavior without corresponding updates in source control. This risks inconsistencies and complicates auditing or collaboration. Strict migration and schema versioning are essential to avoid these issues.

### Practical Observations

During the development of the alcohol tracking app, the following practical observations were made:

- **Schema Evolution:**  
  Adding new features (such as drink types or session invitations) was straightforward, as new tables and relationships could be exposed immediately via PostgREST. However, careful migration planning was required to avoid breaking existing API consumers.
- **Performance:**  
  For typical usage patterns (e.g., tracking drinks in real time during a session), the performance was more than adequate. PostgreSQL's query planner and indexing capabilities ensured responsive APIs.
- **Frontend Integration:**  
  The React frontend could consume the RESTful API directly, simplifying data fetching and reducing the need for custom API endpoints. However, some client-side logic was needed to handle authentication tokens and error states.
- **Security:**  
  Implementing RLS policies for per-user and per-session data access was effective, but required a solid understanding of PostgreSQL's security model.

## Conclusion

In conclusion, adopting PostgreSQL as a service—using PostgREST and relevant extensions—demonstrates clear benefits for rapid, iterative development, particularly in user-centric or collaborative applications. This approach streamlines the technology stack, reduces the need for custom backend code, and leverages the robustness and maturity of the PostgreSQL ecosystem. Centralizing business logic and access control within the database can improve consistency, security, and maintainability, especially when combined with careful schema management and migration practices.

However, this architecture is not without its challenges. Security must be enforced rigorously at the database level, and the learning curve for advanced PostgreSQL features (such as RLS and custom extensions) can be significant. As applications grow in complexity or scale, the absence of a traditional backend layer may limit flexibility, integration options, and scalability. Furthermore, reliance on PostgreSQL-specific features can introduce vendor lock-in and reduce portability.

Overall, PostgreSQL as a service is a compelling solution for small to medium-sized projects, prototypes, and academic experiments where speed, simplicity, and data integrity are priorities. For teams with strong SQL expertise and a commitment to best practices in database design and security, this paradigm can provide a solid and efficient foundation for modern application development.

## References

- [Replace Your Backend with Postgres (YouTube)](https://www.youtube.com/watch?v=3JW732GrMdg)
- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html)
- [pgjwt](https://github.com/michelp/pgjwt)
- [PostgREST](https://postgrest.org/)

## Appendix

### pgcrypto

The `pgcrypto` module provides cryptographic functions for PostgreSQL.  
Examples in `src/sql/extensions/pgcrypto.sql` demonstrate setup and basic usage.

#### Setup

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

#### Password Hashing

The `crypt(password text, salt text)` function securely stores passwords with a salt.  
Salts are generated using `gen_salt(type text [, iter_count integer ])`.

#### Password Verification

To verify passwords, use:

```sql
crypt(plaintext_password, hashed_password) = hashed_password
```

A reusable function example:

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

The `pgjwt` extension enables creation and verification of JSON Web Tokens (JWT) in PostgreSQL.

#### Setup

```sql
CREATE EXTENSION IF NOT EXISTS pgjwt;
```

#### Creating a JWT

```sql
SELECT sign(
  '{"sub": "user123", "role": "admin"}',
  'your_secret_key'
) AS jwt_token;
```

With standard claims:

```sql
SELECT sign(
  json_build_object(
    'sub', 'user123',
    'role', 'admin',
    'iat', EXTRACT(EPOCH FROM now())::integer,
    'exp', EXTRACT(EPOCH FROM now() + INTERVAL '5 minutes')::integer
  ),
  'your_secret_key'
) AS jwt_token;
```

#### Verifying a JWT

```sql
SELECT verify(
  'jwt_token_here',
  'your_secret_key'
) AS payload;
```

### PostgREST

PostgREST is a standalone middleware server that generates a RESTful API from your database schema.

#### Example Setup

1. **Schema, Roles, and Table:**

```sql
-- Remove existing schema and create a new one
DROP SCHEMA IF EXISTS api CASCADE;
CREATE SCHEMA api;

-- Create roles for anonymous and authenticated access
DROP ROLE IF EXISTS web_anon;
CREATE ROLE web_anon nologin;
GRANT USAGE ON SCHEMA api TO web_anon;

CREATE TABLE api.todos (
  id INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  task TEXT NOT NULL,
  due TIMESTAMPTZ
);

INSERT INTO api.todos (task) VALUES
  ('finish tutorial 0'), ('pat self on back');

GRANT SELECT ON api.todos TO web_anon;

DROP ROLE IF EXISTS authenticator;
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'mysecretpassword';
GRANT web_anon TO authenticator;
```

2. **Docker Compose Example:**

```yaml
postgrest:
  image: postgrest/postgrest
  ports:
    - "3000:3000"
  environment:
    PGRST_DB_URI: postgres://authenticator:mysecretpassword@db:5432/postgres
    PGRST_DB_ANON_ROLE: web_anon
    PGRST_DB_SCHEMA: api
    PGRST_OPENAPI_SERVER_PROXY_URI: http://127.0.0.1:3000
  depends_on:
    - db
```

Test the REST endpoint with:

```sh
curl http://localhost:3000/todos
```

This returns the list of todos in JSON format.