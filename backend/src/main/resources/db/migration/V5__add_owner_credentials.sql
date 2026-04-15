-- V5__add_owner_credentials.sql
-- 为 owners 表增加登录凭证字段，支持多 owner 账号管理

ALTER TABLE owners
    ADD COLUMN IF NOT EXISTS username      VARCHAR(50),
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_owners_username ON owners (username)
    WHERE username IS NOT NULL;
