package com.syntra.notification.scheduler;

import com.syntra.notification.entity.NotificationConfig;
import com.syntra.notification.repository.NotificationConfigRepository;
import com.syntra.notification.repository.PushTokenRepository;
import com.syntra.notification.service.NotificationLogService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Component
public class NotificationSchedulerService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final NotificationConfigRepository configRepository;
    private final PushTokenRepository pushTokenRepository;
    private final NotificationLogService logService;
    private final RestTemplate restTemplate = new RestTemplate();

    public NotificationSchedulerService(NotificationConfigRepository configRepository,
                                         PushTokenRepository pushTokenRepository,
                                         NotificationLogService logService) {
        this.configRepository = configRepository;
        this.pushTokenRepository = pushTokenRepository;
        this.logService = logService;
    }

    // Runs once every minute. Requires @EnableScheduling on your main application class.
    @Scheduled(cron = "0 * * * * *")
    public void dispatchDueNotifications() {
        LocalTime now = LocalTime.now().truncatedTo(ChronoUnit.MINUTES);

        List<NotificationConfig> dueConfigs = configRepository.findAll().stream()
            .filter(config -> config.getTimeOfDay().truncatedTo(ChronoUnit.MINUTES).equals(now))
            .toList();

        for (NotificationConfig config : dueConfigs) {
            var tokenRecord = pushTokenRepository.findByUserId(config.getUserId());

            if (tokenRecord.isEmpty()) {
                // User has no registered device — nothing to send to, log it as failed so it's visible
                logService.record(config.getUserId(), config.getGoalId(), config.getMessage(), "FAILED");
                continue;
            }

            try {
                sendPush(tokenRecord.get().getExpoPushToken(), "SYNTRA", config.getMessage());
                logService.record(config.getUserId(), config.getGoalId(), config.getMessage(), "SENT");
            } catch (Exception e) {
                logService.record(config.getUserId(), config.getGoalId(), config.getMessage(), "FAILED");
            }
        }
    }

    // Expo's push API is a single plain POST — no SDK required.
    // Docs: https://docs.expo.dev/push-notifications/sending-notifications/
    private void sendPush(String expoPushToken, String title, String body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");

        Map<String, Object> payload = Map.of(
            "to", expoPushToken,
            "title", title,
            "body", body,
            "sound", "default"
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        restTemplate.postForEntity(EXPO_PUSH_URL, request, String.class);
        // Expo returns 200 with a per-token receipt even on some failures (e.g. bad token) —
        // for a first version, treating HTTP 200 as "SENT" is fine. If you want to catch
        // invalid/expired tokens specifically later, parse the response body's "status" field.
    }
}
