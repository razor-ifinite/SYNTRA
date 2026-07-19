package com.syntra.notification.dto;
import java.util.UUID;

public record NotificationResponse(
    UUID id,
    UUID userId,
    String title,
    String message,
    String type,
    boolean isRead,
    String createdAt
) {}
