package com.syntra.notification.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record NotificationRequest(
    @NotNull UUID userId,
    @NotBlank String title,
    @NotBlank String message,
    String type
) {}
