package com.syntra.notification.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_logs")
public class NotificationLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "goal_id", nullable = false)
    private UUID goalId;

    @Column(nullable = false)
    private String message;

    @Column(name = "sent_at", nullable = false)
    private OffsetDateTime sentAt = OffsetDateTime.now();

    @Column(nullable = false)
    private String status; // "SENT" or "FAILED"

    protected NotificationLog() {
        // required by JPA
    }

    public NotificationLog(UUID userId, UUID goalId, String message, String status) {
        this.userId = userId;
        this.goalId = goalId;
        this.message = message;
        this.status = status;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getGoalId() { return goalId; }
    public String getMessage() { return message; }
    public OffsetDateTime getSentAt() { return sentAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
