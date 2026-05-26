-- Long delivery addresses (run on your DB; pick the dialect you use).

-- PostgreSQL
ALTER TABLE deliveries
  ALTER COLUMN address TYPE TEXT;

-- MySQL / MariaDB (uncomment if you use MySQL instead of PostgreSQL)
-- ALTER TABLE deliveries
--   MODIFY COLUMN address TEXT NOT NULL;
