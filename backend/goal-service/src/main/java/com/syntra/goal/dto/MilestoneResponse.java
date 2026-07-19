package com.syntra.goal.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MilestoneResponse(
        UUID id,
        UUID goalId,
        String title,
        OffsetDateTime dueDate,
        String status,
        OffsetDateTime createdAt
) {
}
