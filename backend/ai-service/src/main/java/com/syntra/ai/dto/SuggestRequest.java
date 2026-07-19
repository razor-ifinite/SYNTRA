package com.syntra.ai.dto;
import java.util.List;

public record SuggestRequest(
    String userContext,       // e.g. "I want to learn Spanish in 3 months"
    List<String> existingGoals,   // list of current goal titles
    String preferredStyle     // e.g. "structured", "flexible", "aggressive"
) {}
