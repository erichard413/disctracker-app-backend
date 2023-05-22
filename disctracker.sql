\echo 'Delete and recreate disctracker db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS disctracker;
CREATE DATABASE disctracker;

\connect disctracker

\i disctracker-schema.sql
\i disctracker-seed.sql

\echo 'Delete and recreate disctracker_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS disctracker_test;
CREATE DATABASE disctracker_test;

\connect disctracker_test

\i disctracker-schema.sql
\i disctracker-seed.sql

