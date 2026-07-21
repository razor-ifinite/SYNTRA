package com.syntra.notification.repository;

import com.syntra.notification.entity.NotificationConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationConfigRepository extends JpaRepository<NotificationConfig, UUID> {

    List<NotificationConfig> findByGoalId(UUID goalId);

    // One config per goal for now (matches the single PUT-to-update flow in the handoff doc)
    Optional<NotificationConfig> findFirstByGoalId(UUID goalId);
}
