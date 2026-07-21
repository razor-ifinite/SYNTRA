package com.syntra.notification.service;

import com.syntra.notification.dto.NotificationConfigRequest;
import com.syntra.notification.dto.NotificationConfigResponse;
import com.syntra.notification.entity.NotificationConfig;
import com.syntra.notification.repository.NotificationConfigRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.UUID;

@Service
public class NotificationConfigService {

    private final NotificationConfigRepository repository;

    public NotificationConfigService(NotificationConfigRepository repository) {
        this.repository = repository;
    }

    public NotificationConfigResponse create(NotificationConfigRequest request) {
        NotificationConfig config = new NotificationConfig(
            request.userId(),
            request.goalId(),
            request.frequency(),
            LocalTime.parse(request.timeOfDay()),
            request.message()
        );
        return toResponse(repository.save(config));
    }

    public NotificationConfigResponse update(UUID goalId, NotificationConfigRequest request) {
        NotificationConfig config = repository.findFirstByGoalId(goalId)
            .orElseThrow(() -> new IllegalArgumentException("No notification config found for goal " + goalId));

        config.setFrequency(request.frequency());
        config.setTimeOfDay(LocalTime.parse(request.timeOfDay()));
        config.setMessage(request.message());

        return toResponse(repository.save(config));
    }

    public NotificationConfigResponse getByGoalId(UUID goalId) {
        NotificationConfig config = repository.findFirstByGoalId(goalId)
            .orElseThrow(() -> new IllegalArgumentException("No notification config found for goal " + goalId));
        return toResponse(config);
    }

    private NotificationConfigResponse toResponse(NotificationConfig config) {
        return new NotificationConfigResponse(
            config.getId(),
            config.getUserId(),
            config.getGoalId(),
            config.getFrequency(),
            config.getTimeOfDay().toString(),
            config.getMessage(),
            config.getCreatedAt()
        );
    }
}
