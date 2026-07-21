package com.syntra.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PushTokenRequest(
    @NotNull UUID userId,
    @NotBlank String expoPushToken
) {}
