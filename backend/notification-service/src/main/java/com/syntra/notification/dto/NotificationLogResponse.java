package com.syntra.notification.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationLogResponse(
    UUID id,
    UUID userId,
    UUID goalId,
    String message,
    OffsetDateTime sentAt,
    String status   // "SENT" or "FAILED"
) {}
