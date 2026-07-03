package com.syntra.ai.dto;

public record AiResponse(
    String content,
    String model,
    boolean success
) {}
