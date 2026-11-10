-- Run as a database administrator after applying Alembic revision 0012.
-- Create the login role and set its password interactively; never commit a secret:
--   CREATE ROLE academy_course_publisher LOGIN NOSUPERUSER NOCREATEDB
--     NOCREATEROLE NOINHERIT NOBYPASSRLS;
--   \password academy_course_publisher
--
-- Connect to the target database, then execute the grants below. Replace the
-- placeholder database name if using the GRANT CONNECT statement.
GRANT CONNECT ON DATABASE academy_database TO academy_course_publisher;
GRANT USAGE ON SCHEMA public TO academy_course_publisher;
GRANT SELECT, INSERT ON TABLE course_releases TO academy_course_publisher;
GRANT INSERT ON TABLE audit_events TO academy_course_publisher;
-- Required only for evaluation of the existing audit insert policy's EXISTS clause.
-- The migration installs a restrictive RLS policy that makes this role see zero rows.
GRANT SELECT ON TABLE tenant_memberships TO academy_course_publisher;
-- Read-only schema-head guard: publication is refused unless migration 0012 is current.
GRANT SELECT ON TABLE alembic_version TO academy_course_publisher;

-- Do not grant this role membership in another role. Do not grant UPDATE,
-- DELETE, TRUNCATE, CREATE, BYPASSRLS, or privileges on identity/learner tables.
