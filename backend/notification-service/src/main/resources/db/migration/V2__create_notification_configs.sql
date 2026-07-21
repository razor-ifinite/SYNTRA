CREATE TABLE notification_configs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    goal_id     UUID NOT NULL,
    frequency   VARCHAR(20) NOT NULL,
    time_of_day TIME NOT NULL,
    message     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_configs_goal_id ON notification_configs(goal_id);
CREATE INDEX idx_notification_configs_user_id ON notification_configs(user_id);
