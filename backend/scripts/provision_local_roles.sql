-- Local development only. Run after Alembic reaches 0012_platform_publisher_audit.
-- Passwords are read from the process environment; they are never printed.
\getenv runtime_password ACADEMY_RUNTIME_PASSWORD
\getenv publisher_password ACADEMY_PUBLISHER_PASSWORD
\getenv database_name ACADEMY_DB_NAME
\getenv admin_user ACADEMY_DB_ADMIN_USER

\if :{?runtime_password}
\else
  \echo 'ACADEMY_RUNTIME_PASSWORD is required'
  \quit 2
\endif
\if :{?publisher_password}
\else
  \echo 'ACADEMY_PUBLISHER_PASSWORD is required'
  \quit 2
\endif

SELECT format(
  'CREATE ROLE academy_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS PASSWORD %L',
  :'runtime_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'academy_runtime')
\gexec
ALTER ROLE academy_runtime
  LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS
  PASSWORD :'runtime_password';

SELECT format(
  'CREATE ROLE academy_course_publisher LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS PASSWORD %L',
  :'publisher_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'academy_course_publisher')
\gexec
ALTER ROLE academy_course_publisher
  LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS
  PASSWORD :'publisher_password';

-- Remove any inherited role memberships before granting direct table privileges.
SELECT format('REVOKE %I FROM academy_runtime', parent.rolname)
FROM pg_auth_members membership
JOIN pg_roles parent ON parent.oid = membership.roleid
WHERE membership.member = 'academy_runtime'::regrole
\gexec
SELECT format('REVOKE %I FROM academy_course_publisher', parent.rolname)
FROM pg_auth_members membership
JOIN pg_roles parent ON parent.oid = membership.roleid
WHERE membership.member = 'academy_course_publisher'::regrole
\gexec

GRANT CONNECT ON DATABASE :"database_name" TO academy_runtime, academy_course_publisher;
GRANT USAGE ON SCHEMA public TO academy_runtime, academy_course_publisher;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM academy_runtime;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM academy_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO academy_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO academy_runtime;
-- Course releases are global immutable content: only the platform publisher may create them.
REVOKE INSERT, UPDATE, DELETE ON TABLE course_releases FROM academy_runtime;
GRANT SELECT ON TABLE course_releases TO academy_runtime;
GRANT SELECT ON TABLE alembic_version TO academy_runtime;
-- Do not grant future migration-created tables by default. Remove any prior
-- default grants and re-run this script after each schema migration to review
-- and grant access to newly introduced tables explicitly.
ALTER DEFAULT PRIVILEGES FOR ROLE :"admin_user" IN SCHEMA public
  REVOKE ALL ON TABLES FROM academy_runtime;
ALTER DEFAULT PRIVILEGES FOR ROLE :"admin_user" IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM academy_runtime;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM academy_course_publisher;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM academy_course_publisher;
REVOKE CREATE ON SCHEMA public FROM academy_course_publisher;
GRANT SELECT, INSERT ON TABLE course_releases TO academy_course_publisher;
GRANT INSERT ON TABLE audit_events TO academy_course_publisher;
GRANT SELECT ON TABLE tenant_memberships TO academy_course_publisher;
GRANT SELECT ON TABLE alembic_version TO academy_course_publisher;

SELECT rolname, rolsuper, rolbypassrls, rolinherit
FROM pg_roles
WHERE rolname IN ('academy_runtime', 'academy_course_publisher')
ORDER BY rolname;
