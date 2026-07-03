package com.syntra.goal.dto;

import java.util.UUID;

public record MilestoneRequest(
        String title,
        String dueDate,
        UUID goalId
) {
}
