---
marp: true
theme: rose-pine
paginate: true
headingDivider: 2
---


# Frontend Apps with PostgREST

How to build modern apps without a traditional backend

<!-- ~0:30 min -->

## Why Skip the Backend?

- **Traditional stack:**  
  Frontend → Backend (API) → Database

- **With PostgREST:**  
  Frontend → PostgREST → Database

- **Benefits:**  
  - Rapid prototyping  
  - Less boilerplate  
  - Direct access to data  
  - Centralized logic & security

<!-- ~0:45 min (1:15 total) -->

## What is PostgREST?

- **PostgREST** is a standalone server that turns your PostgreSQL database into a RESTful API automatically.

- **Key features:**  
  - Exposes tables, views, and functions as REST endpoints  
  - Supports filtering, pagination, and relationships  
  - Integrates with PostgreSQL roles and Row Level Security (RLS)
  - Uses JWTs to securely identify users and enforce permissions based on claims
<!-- ~0:45 min (2:00 total) -->

## How Does It Work?

1. **Define your schema** in PostgreSQL (tables, views, functions)
2. **Configure roles and permissions** (e.g., `web_anon`, `app_user`)
3. **Start PostgREST** pointing at your database
4. **Frontend** (React, etc.) makes HTTP requests directly to PostgREST

<!-- ~0:45 min (2:45 total) -->

## Security: Authentication

- **Password Hashing:**  
  Use `pgcrypto` for secure password storage

- **JWT Authentication:**  
  - On login/register, DB function issues a JWT (via `pgjwt`)
  - Frontend stores JWT and sends it in HTTP headers

- **Example:**  

  ```sql
  -- Issue JWT for todo app user
  SELECT sign(
    json_build_object('sub', user_id, 'role', 'app_user', 'exp', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP + INTERVAL '1 HOUR')::text),
    secret
  ) FROM auth.secrets WHERE is_active = TRUE;
  ```

<!-- ~1:00 min (4:30 total) -->

## Security: Authorization

- **Row Level Security (RLS):**  
  - Policies restrict which rows each user can access
  - Enforced by PostgreSQL, not the app

- **Example Policy:**  

  ```sql
  -- Only allow users to access their own todos
  CREATE POLICY user_todo_access ON todos
    FOR ALL TO app_user
    USING (owner_id = current_setting('request.jwt.claim.sub')::uuid);
  ```

- **Roles:**  
  - `web_anon`: anonymous, read-only
  - `app_user`: authenticated, can read/write own todos

<!-- ~1:00 min (5:30 total) -->

## Frontend Integration

- Fetch data directly from PostgREST endpoints
- Use JWT in `Authorization` header

```ts
// Fetch todos for the logged-in user
const response = await axios.get('https://postgrest/todos', {
    params: {
        owner_id: `<user_id>`,
        order: 'created_at.desc',
        limit: 10,
        offset: 20,
    },
    headers: {
        Authorization: 'Bearer <jwt>',
        'Accept-Profile': '<schema>',
        'Content-Profile': '<schema>',
    }
});
```

<!-- ~0:45 min (6:15 total) -->

## Pros & Cons

**Pros:**  

- Fast development, less code  
- Security enforced at the data layer  
- Easy to expose new features

**Cons:**  

- Must design RLS policies carefully  
- Complex business logic can be harder in SQL  
- Debugging SQL/RLS can be tricky

<!-- ~0:45 min (7:00 total) -->

## Best Practices & Tips

- **Test RLS policies thoroughly**
- **Keep business logic in SQL functions/views**
- **Use migrations with versioning for schema changes**
- **Document your API endpoints** (Swagger / OpenAPI)

<!-- ~0:45 min (7:45 total) -->

## Takeaways

- PostgREST lets you build secure, modern apps **without a backend**
- PostgreSQL handles both **data** and **security**
- RLS and JWTs are key for safe direct access
- Great for rapid prototyping and small/medium projects which do not require too much business logic

<!-- ~0:15 min (8:00 total) -->