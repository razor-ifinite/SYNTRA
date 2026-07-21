CREATE TABLE notification_logs (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id  UUID NOT NULL,
    goal_id  UUID NOT NULL,
    message  TEXT NOT NULL,
    sent_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    status   VARCHAR(20) NOT NULL
);

CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
