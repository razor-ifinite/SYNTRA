package com.syntra.goal.dto;

import java.util.List;

public record GoalProgressResponse(
        GoalResponse goal,
        List<MilestoneResponse> milestones,
        double completionPercentage
) {
}
