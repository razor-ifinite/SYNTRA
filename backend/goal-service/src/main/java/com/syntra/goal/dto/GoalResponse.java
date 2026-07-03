package com.syntra.goal.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record GoalResponse(
        UUID id,
        UUID userId,
        String title,
        String description,
        OffsetDateTime deadline,
        String status,
        OffsetDateTime createdAt
) {
}
