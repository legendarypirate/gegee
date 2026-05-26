-- Run once on the delivery DB: active users for filters & login.
ALTER TABLE users
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '0 = deactivated';
