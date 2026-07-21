package com.syntra.notification.service;

import com.syntra.notification.dto.NotificationLogResponse;
import com.syntra.notification.entity.NotificationLog;
import com.syntra.notification.repository.NotificationLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationLogService {

    private final NotificationLogRepository repository;

    public NotificationLogService(NotificationLogRepository repository) {
        this.repository = repository;
    }

    public List<NotificationLogResponse> getByUserId(UUID userId) {
        return repository.findByUserIdOrderBySentAtDesc(userId).stream()
            .map(log -> new NotificationLogResponse(
                log.getId(),
                log.getUserId(),
                log.getGoalId(),
                log.getMessage(),
                log.getSentAt(),
                log.getStatus()
            ))
            .collect(Collectors.toList());
    }

    // Called by the scheduler after each send attempt
    public NotificationLog record(UUID userId, UUID goalId, String message, String status) {
        return repository.save(new NotificationLog(userId, goalId, message, status));
    }
}
