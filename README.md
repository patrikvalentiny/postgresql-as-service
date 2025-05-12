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
TBD

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