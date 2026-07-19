package com.syntra.notification.service;

import com.syntra.notification.dto.NotificationRequest;
import com.syntra.notification.dto.NotificationResponse;
import com.syntra.notification.model.Notification;
import com.syntra.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification testNotification;
    private final UUID testNotificationId = UUID.randomUUID();
    private final UUID testUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        testNotification = new Notification(
                testNotificationId,
                testUserId,
                "Test Title",
                "Test Message",
                Notification.NotificationType.INFO,
                false,
                OffsetDateTime.now()
        );
    }

    @Test
    void createNotification_Success() {
        NotificationRequest request = new NotificationRequest(
                testUserId,
                "Test Title",
                "Test Message",
                "INFO"
        );

        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        NotificationResponse response = notificationService.createNotification(request);

        assertNotNull(response);
        assertEquals(testNotificationId, response.id());
        assertEquals(testUserId, response.userId());
        assertEquals("Test Title", response.title());
        assertEquals("Test Message", response.message());
        assertEquals("INFO", response.type());
        assertFalse(response.isRead());

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void getNotificationsByUser_ReturnsList() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(testUserId))
                .thenReturn(Arrays.asList(testNotification));

        List<NotificationResponse> responses = notificationService.getNotificationsByUser(testUserId);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(testNotificationId, responses.get(0).id());
    }

    @Test
    void getUnreadByUser_ReturnsList() {
        when(notificationRepository.findByUserIdAndIsReadFalse(testUserId))
                .thenReturn(Arrays.asList(testNotification));

        List<NotificationResponse> responses = notificationService.getUnreadByUser(testUserId);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(testNotificationId, responses.get(0).id());
    }

    @Test
    void markAsRead_Success() {
        when(notificationRepository.findById(testNotificationId)).thenReturn(Optional.of(testNotification));
        
        Notification readNotification = new Notification(
                testNotificationId,
                testUserId,
                "Test Title",
                "Test Message",
                Notification.NotificationType.INFO,
                true, // Marked as read
                OffsetDateTime.now()
        );
        when(notificationRepository.save(any(Notification.class))).thenReturn(readNotification);

        NotificationResponse response = notificationService.markAsRead(testNotificationId);

        assertNotNull(response);
        assertTrue(response.isRead());
    }

    @Test
    void markAsRead_NotFound_ThrowsException() {
        when(notificationRepository.findById(testNotificationId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            notificationService.markAsRead(testNotificationId);
        });

        assertEquals("Notification not found with id: " + testNotificationId, exception.getMessage());
    }
}
