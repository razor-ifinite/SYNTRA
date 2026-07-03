package com.syntra.goal.dto;

import java.util.UUID;

public record GoalRequest(
        String title,
        String description,
        String deadline,
        UUID userId
) {
}
