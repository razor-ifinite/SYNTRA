package com.syntra.notification.controller;

import com.syntra.notification.dto.NotificationConfigRequest;
import com.syntra.notification.dto.NotificationConfigResponse;
import com.syntra.notification.service.NotificationConfigService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications/config")
public class NotificationConfigController {

    private final NotificationConfigService service;

    public NotificationConfigController(NotificationConfigService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<NotificationConfigResponse> create(@Valid @RequestBody NotificationConfigRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<NotificationConfigResponse> update(@Valid @RequestBody NotificationConfigRequest request) {
        return ResponseEntity.ok(service.update(request.goalId(), request));
    }

    @GetMapping
    public ResponseEntity<NotificationConfigResponse> getByGoal(@RequestParam UUID goalId) {
        return ResponseEntity.ok(service.getByGoalId(goalId));
    }
}
