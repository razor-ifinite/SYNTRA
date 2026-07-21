package com.syntra.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record NotificationConfigRequest(
    @NotNull UUID userId,
    @NotNull UUID goalId,
    @NotNull FrequencyType frequency,
    @NotBlank String timeOfDay,   // "HH:mm" e.g. "08:00" — parsed to LocalTime in the service
    String message
) {}
