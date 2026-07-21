package com.syntra.notification.entity;

import com.syntra.notification.dto.FrequencyType;
import jakarta.persistence.*;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_configs")
public class NotificationConfig {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "goal_id", nullable = false)
    private UUID goalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FrequencyType frequency;

    @Column(name = "time_of_day", nullable = false)
    private LocalTime timeOfDay;

    @Column
    private String message;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected NotificationConfig() {
        // required by JPA
    }

    public NotificationConfig(UUID userId, UUID goalId, FrequencyType frequency, LocalTime timeOfDay, String message) {
        this.userId = userId;
        this.goalId = goalId;
        this.frequency = frequency;
        this.timeOfDay = timeOfDay;
        this.message = message;
    }

    public UUID getId() { return id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getGoalId() { return goalId; }
    public void setGoalId(UUID goalId) { this.goalId = goalId; }

    public FrequencyType getFrequency() { return frequency; }
    public void setFrequency(FrequencyType frequency) { this.frequency = frequency; }

    public LocalTime getTimeOfDay() { return timeOfDay; }
    public void setTimeOfDay(LocalTime timeOfDay) { this.timeOfDay = timeOfDay; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
}
