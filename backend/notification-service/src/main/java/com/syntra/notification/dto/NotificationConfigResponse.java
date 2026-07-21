package com.syntra.notification.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationConfigResponse(
    UUID id,
    UUID userId,
    UUID goalId,
    FrequencyType frequency,
    String timeOfDay,
    String message,
    OffsetDateTime createdAt
) {}
