package com.syntra.notification.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "push_tokens")
public class PushToken {

    @Id
    @Column(name = "user_id")
    private UUID userId; // one token per user — simplest possible model

    @Column(name = "expo_push_token", nullable = false)
    private String expoPushToken;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    protected PushToken() {
        // required by JPA
    }

    public PushToken(UUID userId, String expoPushToken) {
        this.userId = userId;
        this.expoPushToken = expoPushToken;
    }

    public UUID getUserId() { return userId; }

    public String getExpoPushToken() { return expoPushToken; }
    public void setExpoPushToken(String expoPushToken) {
        this.expoPushToken = expoPushToken;
        this.updatedAt = OffsetDateTime.now();
    }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
