package com.syntra.ai.dto;

public record MotivateRequest(
    String goalTitle,
    double completionPercentage,
    int daysRemaining
) {}
