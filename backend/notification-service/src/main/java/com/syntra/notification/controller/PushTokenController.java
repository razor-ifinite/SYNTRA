package com.syntra.notification.controller;

import com.syntra.notification.dto.PushTokenRequest;
import com.syntra.notification.entity.PushToken;
import com.syntra.notification.repository.PushTokenRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications/push-token")
public class PushTokenController {

    private final PushTokenRepository repository;

    public PushTokenController(PushTokenRepository repository) {
        this.repository = repository;
    }

    // Call this once from the frontend, right after registerForPushNotifications()
    // succeeds and returns a token. Safe to call again on every login too —
    // it just overwrites the existing token for that user.
    @PostMapping
    public ResponseEntity<Void> saveToken(@Valid @RequestBody PushTokenRequest request) {
        PushToken token = repository.findByUserId(request.userId())
            .orElse(new PushToken(request.userId(), request.expoPushToken()));

        token.setExpoPushToken(request.expoPushToken());
        repository.save(token);

        return ResponseEntity.ok().build();
    }
}
