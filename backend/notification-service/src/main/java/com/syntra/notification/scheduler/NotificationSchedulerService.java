package com.syntra.notification.scheduler;

import com.syntra.notification.entity.NotificationConfig;
import com.syntra.notification.repository.NotificationConfigRepository;
import com.syntra.notification.service.NotificationLogService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class NotificationSchedulerService {

    private final NotificationConfigRepository configRepository;
    private final NotificationLogService logService;

    public NotificationSchedulerService(NotificationConfigRepository configRepository,
                                         NotificationLogService logService) {
        this.configRepository = configRepository;
        this.logService = logService;
    }

    // Runs once every minute, checks which configs are due "now" and dispatches them.
    // Requires @EnableScheduling on your main application class — see setup note below.
    @Scheduled(cron = "0 * * * * *")
    public void dispatchDueNotifications() {
        LocalTime now = LocalTime.now().truncatedTo(ChronoUnit.MINUTES);

        List<NotificationConfig> dueConfigs = configRepository.findAll().stream()
            .filter(config -> config.getTimeOfDay().truncatedTo(ChronoUnit.MINUTES).equals(now))
            .toList();

        for (NotificationConfig config : dueConfigs) {
            try {
                // TODO: send the actual Expo push notification here using the user's
                // stored push token (see the frontend's registerForPushNotifications()).
                // sendPush(config.getUserId(), config.getMessage());

                logService.record(config.getUserId(), config.getGoalId(), config.getMessage(), "SENT");
            } catch (Exception e) {
                logService.record(config.getUserId(), config.getGoalId(), config.getMessage(), "FAILED");
            }
        }
    }
}
