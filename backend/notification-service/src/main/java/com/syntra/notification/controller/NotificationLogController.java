package com.syntra.notification.controller;

import com.syntra.notification.dto.NotificationLogResponse;
import com.syntra.notification.service.NotificationLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications/logs")
public class NotificationLogController {

    private final NotificationLogService service;

    public NotificationLogController(NotificationLogService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<NotificationLogResponse>> getByUser(@RequestParam UUID userId) {
        return ResponseEntity.ok(service.getByUserId(userId));
    }
}
