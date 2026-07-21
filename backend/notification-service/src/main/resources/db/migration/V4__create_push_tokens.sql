-- Rename to match your next real Flyway version (you're at V3 for notification_logs,
-- so this should be V4__create_push_tokens.sql)

CREATE TABLE push_tokens (
    user_id         UUID PRIMARY KEY,
    expo_push_token VARCHAR(255) NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
