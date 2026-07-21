package com.syntra.notification.repository;

import com.syntra.notification.entity.PushToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PushTokenRepository extends JpaRepository<PushToken, UUID> {
    Optional<PushToken> findByUserId(UUID userId);
}
